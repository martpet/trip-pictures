import { Item, TabList, TabPanels, Tabs } from '@adobe/react-spectrum';
import { useIsMobileDevice } from '@react-spectrum/utils';
import { Key, ReactNode } from 'react';
import { useIntl } from 'react-intl';

import { useAppDispatch, useAppSelector } from '~/common/hooks';
import { SettingsDialogTab } from '~/common/types';
import { selectSettingsDialogActiveTab, settingsChanged } from '~/features/settings';

import { ColorsSettings, ExperimentalSettings, LanguagesSettings } from './sections';

export default function Settings() {
  const activeTab = useAppSelector(selectSettingsDialogActiveTab);
  const isMobile = useIsMobileDevice();
  const dispatch = useAppDispatch();
  const { formatMessage } = useIntl();
  const tabListSpace = 'size-400';

  type Tab = {
    key: SettingsDialogTab;
    name: string;
    children: ReactNode;
    disabled?: boolean;
  };

  const tabs: Tab[] = [
    {
      key: 'colors',
      name: formatMessage({ defaultMessage: 'Colors', description: 'settings tab' }),
      children: <ColorsSettings />,
    },
    {
      key: 'language',
      name: formatMessage({ defaultMessage: 'Language', description: 'settings tab' }),
      children: <LanguagesSettings />,
    },
    {
      key: 'experimental',
      name: formatMessage({
        defaultMessage: 'Experimental',
        description: 'settings tab',
      }),
      children: <ExperimentalSettings />,
    },
  ];

  const handleTabChange = (key: Key) => {
    const nextTab = key as SettingsDialogTab;
    dispatch(settingsChanged({ settingsDialogTab: nextTab }));
  };

  return (
    <Tabs
      items={tabs.filter(({ disabled }) => !disabled)}
      selectedKey={activeTab}
      onSelectionChange={handleTabChange}
      orientation={isMobile ? 'horizontal' : 'vertical'}
    >
      <TabList
        marginEnd={isMobile ? 0 : tabListSpace}
        marginBottom={isMobile ? tabListSpace : 0}
      >
        {(tab: Tab) => <Item>{tab.name}</Item>}
      </TabList>
      <TabPanels>{(tab: Tab) => <Item>{tab.children}</Item>}</TabPanels>
    </Tabs>
  );
}
