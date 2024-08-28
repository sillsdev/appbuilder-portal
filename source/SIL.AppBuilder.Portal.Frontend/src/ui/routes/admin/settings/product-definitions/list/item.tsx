import * as React from 'react';
import { compose } from 'recompose';
import CreateIcon from '@material-ui/icons/Create';
import { Link } from 'react-router-dom';
import { withData as withOrbit } from 'react-orbitjs';
import {
  attributesFor,
  ProductDefinitionResource,
  ApplicationTypeResource,
  WorkflowDefinitionResource,
  idFromRecordIdentity,
} from '@data';
import { withTranslations, i18nProps } from '@lib/i18n';

interface IOwnProps {
  productDefinition: ProductDefinitionResource;
  type?: ApplicationTypeResource;
  workflow?: WorkflowDefinitionResource;
  rebuildWorkflow?: WorkflowDefinitionResource;
}

type IProps = IOwnProps & i18nProps;

class ProductDefinitionItem extends React.Component<IProps> {
  render() {
    const { t, productDefinition, type, workflow, rebuildWorkflow, republishWorkflow } = this.props;

    const { name, description } = attributesFor(productDefinition);

    return (
      <div className='flex p-md fs-13 m-b-sm thin-border round-border-4'>
        <div className='flex-grow'>
          <div className='bold fs-16'>{name}</div>
          <div className='p-t-md'>
            <span className='bold m-r-sm'>{t('admin.settings.productDefinitions.type')}:</span>
            <span>{attributesFor(type).name}</span>
          </div>
          <div>
            <span className='bold m-r-sm'>{t('admin.settings.productDefinitions.workflow')}:</span>
            <span>{attributesFor(workflow).name}</span>
          </div>
          <div>
            <span className='bold m-r-sm'>
              {t('admin.settings.productDefinitions.rebuildWorkflow')}:
            </span>
            <span>{attributesFor(rebuildWorkflow).name}</span>
          </div>
          <div>
            <span className='bold m-r-sm'>
              {t('admin.settings.productDefinitions.republishWorkflow')}:
            </span>
            <span>{attributesFor(republishWorkflow).name}</span>
          </div>
          <div>
            <span className='bold m-r-sm'>
              {t('admin.settings.productDefinitions.description')}:
            </span>
            <span>{description}</span>
          </div>
        </div>
        <div>
          <Link
            className='gray-text'
            to={`/admin/settings/product-definitions/${idFromRecordIdentity(
              productDefinition
            )}/edit`}
          >
            <CreateIcon className='fs-16' />
          </Link>
        </div>
      </div>
    );
  }
}

export default compose<IProps, IOwnProps>(
  withTranslations,
  withOrbit(({ productDefinition }) => ({
    type: (q) => q.findRelatedRecord(productDefinition, 'type'),
    workflow: (q) => q.findRelatedRecord(productDefinition, 'workflow'),
    rebuildWorkflow: (q) => q.findRelatedRecord(productDefinition, 'rebuildWorkflow'),
    republishWorkflow: (q) => q.findRelatedRecord(productDefinition, 'republishWorkflow'),
  }))
)(ProductDefinitionItem);
