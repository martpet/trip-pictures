import { Flex, FlexProps, SpectrumProgressCircleProps } from '@adobe/react-spectrum';

import { Spinner } from '~/common/components';

type Props = Omit<FlexProps, 'children'> & {
  dim?: boolean;
  text?: string;
  size?: SpectrumProgressCircleProps['size'];
};

export function LoadingOverlay({ dim, text, size, ...flexProps }: Props) {
  return (
    <Flex
      alignItems="center"
      justifyContent="center"
      flexGrow={1}
      {...flexProps}
      UNSAFE_style={{
        ...(dim && {
          background: 'var(--spectrum-alias-background-color-modal-overlay)',
        }),
      }}
    >
      <Spinner text={text} size={size} />
    </Flex>
  );
}
