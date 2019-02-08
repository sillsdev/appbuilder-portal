import * as React from 'react';
import { withLdml, i18nProps, useLdml } from '@lib/i18n';

interface IOwnProps {
  type: string;
  name: string;
}

type IProps = i18nProps & IOwnProps;

export const Localized = ({ name, type }: IProps) => {
  const { t } = useLdml();

  return t(`localeDisplayNames.${type || 'languages'}.${name}`);
};

export default Localized;
