import { ActionButton, Tooltip, TooltipTrigger } from '@adobe/react-spectrum';
import TargetIcon from '@spectrum-icons/workflow/Target';
import { FormattedMessage } from 'react-intl';
import { GeolocateControl as MapGlGeolocateControl } from 'react-map-gl';

export function GeolocateControl() {
  const handleClick = () => {
    const cssSelector = '.maplibregl-ctrl-geolocate';
    const mapboxControl = document.querySelector<HTMLDivElement>(cssSelector);
    mapboxControl?.click();
  };

  return (
    <>
      <MapGlGeolocateControl style={{ display: 'none' }} />
      <TooltipTrigger>
        <ActionButton onPress={handleClick}>
          <TargetIcon />
        </ActionButton>
        <Tooltip>
          <FormattedMessage
            defaultMessage="Find my location"
            description="map geolocation control"
          />
        </Tooltip>
      </TooltipTrigger>
    </>
  );
}
