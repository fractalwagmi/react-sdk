import { Platform, usePopupConnection } from '@fractalwagmi/popup-connection';
import { FractalSDKContext } from 'context/fractal-sdk-context';
import { useCallback, useContext } from 'react';

interface UseOnrampParameters {
  clientId: string;
  // onSignIn: (user: User) => void;
  // onSignInFailed: (e: FractalSDKError) => void;
  // scopes: Scope[] | undefined;
}

const ONRAMP_URL = 'https://fractal.is/onramp';

export const useOnramp = ({
  clientId,
}: // onSignIn,
// onSignInFailed,
// scopes,
UseOnrampParameters) => {
  const { user } = useContext(FractalSDKContext);
  // const {fetchAndSetUser} = useUserSetter();
  const {
    // close: closePopup,
    // connection,
    open: openPopup,
  } = usePopupConnection({
    enabled: !user,
    platform: Platform.REACT_SDK,
  });

  const triggerOnramp = useCallback(() => {
    openPopup(`${ONRAMP_URL}?clientId=${clientId}`);
  }, []);

  return { triggerOnramp };
};

// useEffect(() => {
//     if (!connection) {
//         return;
//     }
//
//     const handleProjectApproved = async (payload: unknown) => {
//         try {
//             if (!assertPayloadIsProjectApprovedPayload(payload)) {
//                 onSignInFailed(
//                     new FractalSDKAuthenticationUnknownError(
//                         `Received malformed payload from popup. payload = ${payload}`,
//                     ),
//                 );
//                 return;
//             }
//             const userId = payload.user.userId;
//             const accessToken = payload.user.accessToken;
//             const baseUser: BaseUser = { userId };
//             const { user } = await fetchAndSetUser(baseUser, accessToken);
//             closePopup();
//             onSignIn(user);
//         } catch (err: unknown) {
//             if (err instanceof FractalSDKError) {
//                 onSignInFailed(err);
//                 return;
//             }
//             onSignInFailed(
//                 new FractalSDKAuthenticationUnknownError(
//                     `Sign in failed. err = ${err}`,
//                 ),
//             );
//         }
//     };
//
//     const handlePopupClosed = () => {
//         onSignInFailed(new FractalSDKApprovalDeniedError('Sign in refused.'));
//     };
//
//     connection.on(PopupEvent.PROJECT_APPROVED, handleProjectApproved);
//     connection.on(PopupEvent.POPUP_CLOSED, handlePopupClosed);
//
//     return () => {
//         connection.off(PopupEvent.PROJECT_APPROVED, handleProjectApproved);
//         connection.off(PopupEvent.POPUP_CLOSED, handlePopupClosed);
//     };
// }, [connection]);

// return { signIn };
// };
