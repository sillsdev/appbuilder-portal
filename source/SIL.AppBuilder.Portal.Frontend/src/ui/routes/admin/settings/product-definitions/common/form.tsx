import * as React from 'react';
import { compose } from 'recompose';
import { Checkbox, Dropdown } from 'semantic-ui-react';
import { withTemplateHelpers, Mut, Toggle } from 'react-action-decorators';

import { withTranslations, i18nProps } from '@lib/i18n';
import { isEmpty } from '@lib/collection';

import * as toast from '@lib/toast';

import { ProductDefinitionAttributes } from '@data/models/product-definition';
import {
  query,
  buildOptions,
  withLoader,
  attributesFor,
  ApplicationTypeResource,
  WorkflowDefinitionResource,
  ProductDefinitionResource
} from '@data';


interface IOwnProps {
  productDefinition: ProductDefinitionResource;
  type: ApplicationTypeResource;
  onSubmit: (attributes: ProductDefinitionAttributes, relationships: any) => void;
  onCancel: () => void;
}

interface IState {
  name?: string;
  nameError?: string;
  description?: string;
  type?: ApplicationTypeResource;
  typeError?: string;
  workflow?: WorkflowDefinitionResource;
  workflowError?: string;
}

type IProps =
  & i18nProps
  & IOwnProps;


@withTemplateHelpers
class ProductDefinitionForm extends React.Component<IProps, IState> {
  mut: Mut;
  toggle: Toggle;

  constructor(props: IProps) {
    super(props);

    const { productDefinition, type, workflow } = props;

    const {
      name, description
    } = attributesFor(productDefinition);

    this.state = {
      name: (name as string) || '',
      description: (description as string) || '',
      type: type || null,
      typeError: '',
      workflow: workflow || null,
      workflowError: ''
    };

  }

  isValidForm = () => {
    const { name, type, workflow } = this.state;
    const { t } = this.props;

    const nameError = isEmpty(name) ? t('admin.settings.productDefinitions.emptyName'): '';
    const typeError = isEmpty(type) ? t('admin.settings.productDefinitions.emptyType') : '';
    const workflowError = isEmpty(workflow) ? t('admin.settings.productDefinitions.emptyWorkflow') : '';

    this.setState({
      nameError,
      typeError,
      workflowError
    });

    return !isEmpty(type) && !isEmpty(workflow) && !isEmpty(name);
  }

  submit = async (e) => {
    e.preventDefault();

    const { onSubmit } = this.props;
    const {
      name, description, type, workflow
    } = this.state;

    if (this.isValidForm()) {
      try {
        await onSubmit({
          name,
          description
        },{
          type,
          workflow
        });
      } catch(e) {
        toast.error(e);
      }
    }
  }

  cancel = (e) => {
    e.preventDefault();
    const { onCancel } = this.props;
    onCancel();
  }

  typeSelection = type => e => {
    this.setState({
      type
    });
  }

  workflowSelection = workflow => e => {
    this.setState({
      workflow
    });
  }

  render() {
    const { mut, toggle } = this;

    const {
      name, nameError,
      description,
      type, typeError,
      workflow, workflowError
    } = this.state;

    const { t, productDefinition, types, workflows } = this.props;

    const { name: typeName } = attributesFor(type);
    const { name: workflowName } = attributesFor(workflow);

    return (
      <>
        <h2>
          {
            t(productDefinition ?
              'admin.settings.productDefinitions.edit' :
              'admin.settings.productDefinitions.add'
            )
          }
        </h2>
        <div className='flex w-60'>
          <form data-test-form className='ui form flex-grow'>

            <div className='field m-b-xl'>
              <label>{t('admin.settings.productDefinitions.name')}</label>
              <input
                data-test-pd-name
                type='text'
                value={name}
                onChange={mut('name')} />
              <div className='error'>{nameError}</div>
            </div>

            <div className='field m-b-xl'>
              <label>{t('admin.settings.productDefinitions.type')}</label>
              <div className='w-100 thin-bottom-border'>
                <Dropdown
                  className='custom w-100 no-borders p-sm'
                  data-test-pd-type
                  text={typeName}
                >
                  <Dropdown.Menu>
                    {
                      types.map((tp, i) => {
                        const { name: fullName } = attributesFor(tp);
                        return <Dropdown.Item key={i} text={fullName} onClick={this.typeSelection(tp)} />;
                      })
                    }
                  </Dropdown.Menu>
                </Dropdown>
              </div>
              <div className='error'>{typeError}</div>
            </div>

            <div className='field m-b-xl'>
              <label>{t('admin.settings.productDefinitions.workflow')}</label>
              <div className='w-100 thin-bottom-border'>
                <Dropdown
                  className='custom w-100 no-borders p-sm'
                  data-test-pd-workflow
                  text={workflowName}
                >
                  <Dropdown.Menu>
                    {
                      workflows.map((w, i) => {
                        const { name: fullName } = attributesFor(w);
                        return <Dropdown.Item key={i} text={fullName} onClick={this.workflowSelection(w)} />;
                      })
                    }
                  </Dropdown.Menu>
                </Dropdown>
              </div>
              <div className='error'>{workflowError}</div>
            </div>


            <div className='field m-b-xl'>
              <label>{t('admin.settings.productDefinitions.description')}</label>
              <textarea
                data-test-pd-description
                value={description}
                onChange={mut('description')} />
            </div>

            <div className='m-b-xl'>
              <button
                data-test-submit
                className='ui button p-t-md p-b-md p-l-lg p-r-lg'
                onClick={this.submit}>
                {productDefinition ?
                  t('admin.settings.productDefinitions.edit') :
                  t('admin.settings.productDefinitions.add')}
              </button>

              <button
                data-test-pd-cancel
                className='ui button p-t-md p-b-md p-l-lg p-r-lg'
                onClick={this.cancel}>
                {t('common.cancel')}
              </button>
            </div>

          </form>
        </div>
      </>
    );
  }
}

export default compose(
  withTranslations,
  query(() => ({
    types: [
      q => q.findRecords('applicationType'), buildOptions()
    ],
    workflows: [
      q => q.findRecords('workflowDefinition'), buildOptions()
    ],
  })),
  withLoader(({ types, workflows }) => !types && !workflows)
)(ProductDefinitionForm);