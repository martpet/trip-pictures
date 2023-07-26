import { useProvider } from '@adobe/react-spectrum';
import { skipToken } from '@reduxjs/toolkit/dist/query';
import { AnyLayer, Style } from 'mapbox-gl';
import { useLayoutEffect, useState } from 'react';
import { SymbolLayer } from 'react-map-gl';
import { useSelector } from 'react-redux';
import { SetRequired } from 'type-fest';

import { useGetAwsCredentialsQuery } from '~/app';
import { mapsOptions } from '~/common/consts';
import { Language, MapProvider } from '~/common/types';
import { useGetStyleDescriptorQuery } from '~/features/map/mapApi';
import { selectLanguage } from '~/features/settings';

const { esriLightGray, esriDarkGray } = mapsOptions;

export function useMapStyle() {
  const [mapStyle, setMapStyle] = useState<Style>();
  const language = useSelector(selectLanguage);
  const { colorScheme } = useProvider();
  const { mapName, mapProvider } = colorScheme === 'light' ? esriLightGray : esriDarkGray;
  const { data: credentials } = useGetAwsCredentialsQuery();
  const { data: styleDescriptor } = useGetStyleDescriptorQuery(
    credentials ? { mapName, credentials } : skipToken
  );

  useLayoutEffect(() => {
    if (!styleDescriptor) {
      return;
    }

    setMapStyle(localize(styleDescriptor, language, mapProvider));
  }, [styleDescriptor, language, mapProvider]);

  return mapStyle;
}

function localize(
  styleDescriptor: Style,
  language: Language,
  mapProvider: MapProvider
): Style {
  type Localiztor = Record<
    MapProvider,
    {
      textField: string;
      textFieldFallback(orig: string): string;
    }
  >;

  const options: Localiztor = {
    esri: {
      textField: `_name_${language}`,
      textFieldFallback: (orig) => orig.replace(/[{}]/g, ''),
    },
    here: {
      textField: `name:${language}`,
      textFieldFallback: () => 'name',
    },
  };

  if (!Object.keys(options).includes(mapProvider)) {
    return styleDescriptor;
  }

  const localizedLayers = styleDescriptor.layers.map((layer) => {
    if (
      !isSymbolLayerWithLayout(layer) ||
      typeof layer.layout['text-field'] !== 'string' ||
      !layer.layout['text-field'].length
    ) {
      return layer;
    }

    return {
      ...layer,
      layout: {
        ...layer.layout,
        'text-field': [
          'coalesce',
          ['get', options[mapProvider].textField],
          ['get', options[mapProvider].textFieldFallback(layer.layout['text-field'])],
        ],
      },
    } satisfies AnyLayer;
  });

  return {
    ...styleDescriptor,
    layers: localizedLayers,
  };
}

function isSymbolLayerWithLayout(
  layer: AnyLayer
): layer is SetRequired<SymbolLayer, 'layout'> {
  return Boolean((layer as SymbolLayer).layout?.['text-field']);
}
