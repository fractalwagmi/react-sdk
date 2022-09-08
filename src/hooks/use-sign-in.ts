import { FractalSDKContext } from 'context/fractal-sdk-context';
import {
  FractalSDKAuthenticationUnknownError,
  FractalSDKError,
  FractalSDKNetworkError,
} from 'core/error';
import { FractalSDKApprovalDeniedError } from 'core/error/approve';
import { Events } from 'core/messaging';
import { usePopupConnection } from 'hooks/use-popup-connection';
import { useUserSetter } from 'hooks/use-user-setter';
import { isObject } from 'lib/util/guards';
import { useGetAuthUrlMutation } from 'queries/auth';
import { useCallback, useContext, useEffect } from 'react';
import { BaseUser, Scope, User } from 'types';

interface UseSignInParameters {
  clientId: string;
  onSignIn: (user: User) => void;
  onSignInFailed: (e: FractalSDKError) => void;
  scopes: Scope[] | undefined;
}

export const useSignIn = ({
  clientId,
  onSignIn,
  onSignInFailed,
  scopes,
}: UseSignInParameters) => {
  const { user } = useContext(FractalSDKContext);
  const { fetchAndSetUser } = useUserSetter();
  const {
    close: closePopup,
    connection,
    open: openPopup,
  } = usePopupConnection({
    enabled: !user,
  });
  const getAuthUrlMutation = useGetAuthUrlMutation(clientId, scopes);

  const signIn = useCallback(async () => {
    try {
      const { url } = await getAuthUrlMutation.mutateAsync();
      if (!connection) {
        openPopup(url);
        return;
      }
    } catch (err: unknown) {
      if (err instanceof FractalSDKError) {
        onSignInFailed(err);
      } else {
        onSignInFailed(
          new FractalSDKNetworkError(
            `An unexpected network error occurred. err = ${err}`,
          ),
        );
      }
    }
  }, [connection]);

  useEffect(() => {
    if (!connection) {
      return;
    }

    const handleProjectApproved = async (payload: unknown) => {
      try {
        if (!assertPayloadIsProjectApprovedPayload(payload)) {
          onSignInFailed(
            new FractalSDKAuthenticationUnknownError(
              `Received malformed payload from popup. payload = ${payload}`,
            ),
          );
          return;
        }
        const userId = payload.user.userId;
        const accessToken = payload.user.accessToken;
        const baseUser: BaseUser = { userId };
        const { user } = await fetchAndSetUser(baseUser, accessToken);
        closePopup();
        onSignIn(user);
      } catch (e: unknown) {
        onSignInFailed(new FractalSDKError('Sign in failed.'));
      }
    };

    const handlePopupClosed = () => {
      onSignInFailed(new FractalSDKApprovalDeniedError('Sign in refused.'));
    };

    connection.on(Events.PROJECT_APPROVED, handleProjectApproved);
    connection.on(Events.POPUP_CLOSED, handlePopupClosed);

    return () => {
      connection.off(Events.PROJECT_APPROVED, handleProjectApproved);
      connection.off(Events.POPUP_CLOSED, handlePopupClosed);
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
  if (!isObject(payload)) {
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
