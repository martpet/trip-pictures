import { SpectrumProgressCircleProps, useProvider } from '@adobe/react-spectrum';

import { useGetAwsCredentialsQuery } from '~/app';
import { Spinner } from '~/common/components';
import { useGetPointsQuery, useIsLoadingMapTiles } from '~/features/map';

export function MapDataSpinner(props: SpectrumProgressCircleProps) {
  const isLoadingTiles = useIsLoadingMapTiles();
  const { isFetching: isFetchingPoints } = useGetPointsQuery();
  const { isFetching: isFetchingAwsCredentials } = useGetAwsCredentialsQuery();
  const { colorScheme } = useProvider();

  if (!isLoadingTiles && !isFetchingPoints && !isFetchingAwsCredentials) {
    return null;
  }

  return (
    <Spinner
      {...props}
      size="S"
      variant={colorScheme === 'dark' ? 'overBackground' : undefined}
    />
  );
}
