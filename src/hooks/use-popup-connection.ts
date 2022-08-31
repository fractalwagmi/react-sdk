import { Events, validateOrigin } from 'core/messaging';
import { openPopup, POPUP_HEIGHT_PX, POPUP_WIDTH_PX } from 'core/popup';
import { useCallback, useEffect, useState } from 'react';

// TODO: Add support for detecting when a popup is closed (without approval,)
// so we can surface the rejection.

interface SendParams {
  event: Events;
  origin: string;
  payload?: Record<string, unknown>;
}

type EventCallback = (payload: unknown) => void;

interface PopupConnection {
  off: (e: Events, callback: EventCallback) => void;
  on: (e: Events, callback: EventCallback) => void;
  send: (params: SendParams) => void;
  validatedOrigin: string;
}

export const usePopupConnection = () => {
  const [connection, setConnection] = useState<undefined | PopupConnection>(
    undefined,
  );
  const [popupWindow, setPopupWindow] = useState<null | Window>(null);
  const [handlers, setHandlers] = useState(
    new Map<Events, Set<(payload: unknown) => void>>(),
  );

  const send = useCallback(
    ({ event, payload }: SendParams) => {
      if (!connection || !popupWindow) {
        return;
      }

      popupWindow.postMessage(
        {
          event,
          payload,
        },
        connection.validatedOrigin,
      );
    },
    [connection, popupWindow],
  );

  const on: PopupConnection['on'] = useCallback(
    (event, callback) => {
      const callbacks = handlers.get(event) ?? new Set();
      callbacks.add(callback);
      handlers.set(event, callbacks);
    },
    [handlers],
  );

  const off: PopupConnection['off'] = useCallback(
    (event, callback) => {
      const handlersForEvent = handlers.get(event);
      if (!handlersForEvent) {
        return;
      }
      handlersForEvent.delete(callback);
    },
    [handlers],
  );

  const open = useCallback(
    (url: string) => {
      const left = window.screenX + (window.innerWidth - POPUP_WIDTH_PX) / 2;
      const top = window.screenY + (window.innerHeight - POPUP_HEIGHT_PX) / 2;
      const popup = openPopup({
        left,
        top,
        url,
      });
      if (!popup) {
        return;
      }
      setPopupWindow(popup);
    },
    [setPopupWindow],
  );

  const close = useCallback(() => {
    if (!popupWindow) {
      return;
    }
    popupWindow.close();
    setHandlers(new Map());
  }, [popupWindow, setHandlers]);

  const handleMessage = useCallback(
    (e: MessageEvent) => {
      // We only care about events from our own domain.
      if (!validateOrigin(e.origin)) {
        return;
      }

      if (!popupWindow) {
        // TODO: Fix multiple event listeners from registering.
        return;
      }

      if (e.data.event === Events.HANDSHAKE && !connection) {
        popupWindow.postMessage(
          {
            event: Events.HANDSHAKE_ACK,
          },
          e.origin,
        );

        setConnection({
          off,
          on,
          send,
          validatedOrigin: e.origin,
        });
      }

      const eventCallbacks = handlers.get(e.data.event);
      if (!eventCallbacks) {
        return;
      }
      for (const callback of eventCallbacks) {
        callback(e.data.payload);
      }
    },
    [handlers, connection, setConnection, popupWindow, on, off],
  );

  useEffect(() => {
    window.addEventListener('message', handleMessage);

    return () => {
      window.removeEventListener('message', handleMessage);
    };
  }, [handleMessage]);

  return {
    close,
    connection,
    open,
  };
};
