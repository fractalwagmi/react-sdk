import { FractalSDKError } from 'core/error';
import { Events } from 'core/messaging';
import { usePopupConnection } from 'hooks/use-popup-connection';
import { useUserSetter } from 'hooks/use-user-setter';
import { useCallback, useEffect } from 'react';
import { BaseUser, User } from 'types';

interface UseSignInParameters {
  clientId: string;
  code: string | undefined;
  onSignIn: (user: User) => void;
  onSignInFailed: (e: FractalSDKError) => void;
  url: string | undefined;
}

export const useSignIn = ({
  clientId,
  code,
  onSignIn,
  onSignInFailed,
  url,
}: UseSignInParameters) => {
  const { fetchAndSetUser } = useUserSetter();
  const {
    close: closePopup,
    connection,
    open: openPopup,
  } = usePopupConnection();

  const signIn = useCallback(() => {
    if (!url || !code) {
      return;
    }

    if (!connection) {
      openPopup(url);
      return;
    }
  }, [clientId, code, url, onSignIn, onSignInFailed]);

  useEffect(() => {
    if (!connection) {
      return;
    }

    const handleProjectApproved = async (payload: unknown) => {
      try {
        if (!assertPayloadIsProjectApprovedPayload(payload)) {
          // eslint-disable-next-line no-console
          console.error('malformed payload. payload = ', payload);
          return;
        }
        const userId = payload.user.userId;
        const accessToken = payload.user.accessToken;
        const baseUser: BaseUser = { userId };
        const { user } = await fetchAndSetUser(baseUser, accessToken);
        closePopup();
        onSignIn(user);
      } catch (e: unknown) {
        // TODO: Add sentry integration.
        onSignInFailed(new FractalSDKError('Sign in failed.'));
      }
    };

    connection.on(Events.PROJECT_APPROVED, handleProjectApproved);

    return () => {
      connection.off(Events.PROJECT_APPROVED, handleProjectApproved);
    };
  }, [connection]);

  return { signIn };
};

interface ProjectApprovedPayload {
  user: {
    accessToken: string;
    userId: string;
  };
}

function assertPayloadIsProjectApprovedPayload(
  payload: unknown,
): payload is ProjectApprovedPayload {
  if (payload === null) {
    return false;
  }
  if (typeof payload !== 'object') {
    return false;
  }
  if (!Object.prototype.hasOwnProperty.call(payload, 'user')) {
    return false;
  }
  const user = (payload as { user: unknown }).user;
  if (!assertUser(user)) {
    return false;
  }
  return true;
}

function assertUser(user: unknown): user is ProjectApprovedPayload['user'] {
  if (user === null) {
    return false;
  }
  if (typeof user !== 'object') {
    return false;
  }
  if (
    !Object.prototype.hasOwnProperty.call(user, 'userId') ||
    !Object.prototype.hasOwnProperty.call(user, 'accessToken')
  ) {
    return false;
  }
  const maybeUser = user as { accessToken: unknown; userId: unknown };
  if (
    typeof maybeUser.accessToken !== 'string' ||
    typeof maybeUser.userId !== 'string'
  ) {
    return false;
  }
  return true;
}
