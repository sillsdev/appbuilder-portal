import React, { useEffect, useState } from 'react';
import { useTranslations } from '@lib/i18n';

export default function TransitionComment({ comment }) {
  const { t } = useTranslations();

  let adjustedComment = comment || '';
  let consoleTextUrl = '';
  if (adjustedComment.startsWith('system.')) {
    const array = adjustedComment.split(',');
    adjustedComment = t(array[0]);
    if (array.length === 2) {
      consoleTextUrl = array[1];
      return (
        <div>
          <span>{adjustedComment}</span>
          <br />
          <a href={consoleTextUrl}>{t('project.products.publications.console')}</a>
        </div>
      );
    }
  }
  return <span>{adjustedComment}</span>;
}
