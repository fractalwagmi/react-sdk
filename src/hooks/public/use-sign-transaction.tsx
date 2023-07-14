import { useSignAndSendTransaction } from 'hooks/public/use-sign-and-send-transaction';

/** @deprecated Use the renamed `useSignAndSendTransaction` hook instead. */
export const useSignTransaction = () => {
  console.info(
    'useSignTransaction will be renamed to useSignAndSendTransaction in the ' +
      'next major release of the React SDK.',
  );

  const { signAndSendTransaction } = useSignAndSendTransaction();

  return { signTransaction: signAndSendTransaction };
};
