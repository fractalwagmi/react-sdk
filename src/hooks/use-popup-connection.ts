import { Events, validateOrigin } from 'core/messaging';
import { openPopup, POPUP_HEIGHT_PX, POPUP_WIDTH_PX } from 'core/popup';
import { useCallback, useEffect, useRef, useState } from 'react';

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

export interface UsePopupConnectionParameters {
  enabled?: boolean;
}

export const usePopupConnection = ({
  enabled = true,
}: UsePopupConnectionParameters = {}) => {
  const [connection, setConnection] = useState<undefined | PopupConnection>(
    undefined,
  );
  const popupWindowRef = useRef<null | Window>(null);
  const [handlers, setHandlers] = useState(
    new Map<Events, Set<(payload: unknown) => void>>(),
  );

  const runHandlersForEvent = useCallback(
    (event: Events, payload: unknown) => {
      const eventCallbacks = handlers.get(event);
      if (!eventCallbacks) {
        return;
      }
      for (const callback of eventCallbacks) {
        callback(payload);
      }
    },
    [handlers],
  );

  const send = useCallback(
    ({ event, payload }: SendParams) => {
      if (!connection || !popupWindowRef.current) {
        return;
      }

      popupWindowRef.current.postMessage(
        {
          event,
          payload,
        },
        connection.validatedOrigin,
      );
    },
    [connection, popupWindowRef],
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
      if (popupWindowRef.current) {
        return;
      }
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
      popupWindowRef.current = popup;
    },
    [popupWindowRef],
  );

  const close = useCallback(() => {
    if (!popupWindowRef.current) {
      return;
    }
    popupWindowRef.current.close();
    setHandlers(new Map());
    setConnection(undefined);
    popupWindowRef.current = null;
  }, [popupWindowRef]);

  const handleMessage = useCallback(
    (e: MessageEvent) => {
      // We only care about events from our own domain.
      if (!validateOrigin(e.origin)) {
        return;
      }

      if (!popupWindowRef.current) {
        // TODO: Fix multiple event listeners from registering.
        return;
      }

      if (e.data.event === Events.HANDSHAKE && !connection) {
        popupWindowRef.current.postMessage(
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

      if (!connection) {
        return;
      }

      runHandlersForEvent(e.data.event, e.data.payload);

      // Remove the connection once the popup is closed.
      // This clean up needs to run after `runHandlersForEvent` in case any
      // dependents are listening for the POPUP_CLOSED event.
      if (e.data.event === Events.POPUP_CLOSED && connection) {
        setConnection(undefined);
        popupWindowRef.current = null;
      }
    },
    [handlers, connection, setConnection, popupWindowRef, on, off],
  );

  useEffect(() => {
    if (enabled) {
      window.addEventListener('message', handleMessage);
    } else {
      window.removeEventListener('message', handleMessage);
    }
  }, [enabled, handleMessage]);

  return {
    close,
    connection,
    open,
  };
};
