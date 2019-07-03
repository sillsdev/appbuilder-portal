import * as React from 'react';
import { compose } from 'recompose';
import { Checkbox, Dropdown } from 'semantic-ui-react';
import { withTranslations, i18nProps } from '@lib/i18n';
import { isEmpty } from '@lib/collection';
import * as toast from '@lib/toast';
import { ProductDefinitionAttributes } from '@data/models/product-definition';
import { mutCreator, toggleCreator, Toggle, Mut } from 'react-state-helpers';

import {
  query,
  buildOptions,
  withLoader,
  attributesFor,
  ApplicationTypeResource,
  WorkflowDefinitionResource,
  ProductDefinitionResource,
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
  rebuildWorkflow?: WorkflowDefinitionResource;
  republishWorkflow?: WorkflowDefinitionResource;
}

type IProps = i18nProps & IOwnProps;

class ProductDefinitionForm extends React.Component<IProps, IState> {
  mut: Mut;
  toggle: Toggle;

  constructor(props: IProps) {
    super(props);

    const { productDefinition, type, workflow, rebuildWorkflow, republishWorkflow } = props;

    const { name, description } = attributesFor(productDefinition);

    this.mut = mutCreator(this);
    this.toggle = toggleCreator(this);

    this.state = {
      name: (name as string) || '',
      description: (description as string) || '',
      type: type || null,
      typeError: '',
      workflow: workflow || null,
      workflowError: '',
      rebuildWorkflow: rebuildWorkflow || null,
      republishWorkflow: republishWorkflow || null,
    };
  }

  isValidForm = () => {
    const { name, type, workflow } = this.state;
    const { t } = this.props;

    const nameError = isEmpty(name) ? t('admin.settings.productDefinitions.emptyName') : '';
    const typeError = isEmpty(type) ? t('admin.settings.productDefinitions.emptyType') : '';
    const workflowError = isEmpty(workflow)
      ? t('admin.settings.productDefinitions.emptyWorkflow')
      : '';

    this.setState({
      nameError,
      typeError,
      workflowError,
    });

    return !isEmpty(type) && !isEmpty(workflow) && !isEmpty(name);
  };

  submit = async (e) => {
    e.preventDefault();

    const { onSubmit } = this.props;
    const { name, description, type, workflow, rebuildWorkflow, republishWorkflow } = this.state;
    const relationships = { type, workflow };
    if (rebuildWorkflow) {
      Object.assign(relationships, { rebuildWorkflow });
    }
    if (republishWorkflow) {
      Object.assign(relationships, { republishWorkflow });
    }
    if (this.isValidForm()) {
      try {
        await onSubmit(
          {
            name,
            description,
          },
          relationships
        );
      } catch (e) {
        toast.error(e);
      }
    }
  };

  cancel = (e) => {
    e.preventDefault();
    const { onCancel } = this.props;
    onCancel();
  };

  typeSelection = (type) => (e) => {
    this.setState({
      type,
    });
  };

  workflowSelection = (workflow) => (e) => {
    this.setState({
      workflow,
    });
  };

  rebuildWorkflowSelection = (rebuildWorkflow) => (e) => {
    this.setState({
      rebuildWorkflow,
    });
  };

  republishWorkflowSelection = (republishWorkflow) => (e) => {
    this.setState({
      republishWorkflow,
    });
  };

  render() {
    const { mut, toggle } = this;

    const {
      name,
      nameError,
      description,
      type,
      typeError,
      workflow,
      workflowError,
      rebuildWorkflow,
      republishWorkflow,
    } = this.state;

    const {
      t,
      productDefinition,
      types,
      workflows,
      rebuildWorkflows,
      republishWorkflows,
    } = this.props;

    const { name: typeName } = attributesFor(type);
    const { name: workflowName } = attributesFor(workflow);
    const { name: rebuildWorkflowName } = attributesFor(rebuildWorkflow);
    const { name: republishWorkflowName } = attributesFor(republishWorkflow);
    return (
      <>
        <h2>
          {t(
            productDefinition
              ? 'admin.settings.productDefinitions.edit'
              : 'admin.settings.productDefinitions.add'
          )}
        </h2>
        <div className='flex w-60'>
          <form data-test-form className='ui form flex-grow'>
            <div className='field m-b-xl'>
              <label>{t('admin.settings.productDefinitions.name')}</label>
              <input data-test-pd-name type='text' value={name} onChange={mut('name')} />
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
                    {types.map((tp, i) => {
                      const { name: fullName } = attributesFor(tp);

                      return (
                        <Dropdown.Item
                          key={tp.id}
                          text={fullName}
                          onClick={this.typeSelection(tp)}
                        />
                      );
                    })}
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
                    {workflows.map((w, i) => {
                      const { name: fullName } = attributesFor(w);

                      return (
                        <Dropdown.Item
                          key={w.id}
                          text={fullName}
                          onClick={this.workflowSelection(w)}
                        />
                      );
                    })}
                  </Dropdown.Menu>
                </Dropdown>
              </div>
              <div className='error'>{workflowError}</div>
            </div>

            <div className='field m-b-xl'>
              <label>{t('admin.settings.productDefinitions.rebuildWorkflow')}</label>
              <div className='w-100 thin-bottom-border'>
                <Dropdown
                  className='custom w-100 no-borders p-sm'
                  data-test-pd-workflow
                  text={rebuildWorkflowName}
                >
                  <Dropdown.Menu>
                    <Dropdown.Item
                      key={0}
                      text={t('admin.settings.productDefinitions.noWorkflow')}
                      onClick={this.rebuildWorkflowSelection(null)}
                    />
                    {rebuildWorkflows.map((w, i) => {
                      const { name: fullName } = attributesFor(w);

                      return (
                        <Dropdown.Item
                          key={w.id}
                          text={fullName}
                          onClick={this.rebuildWorkflowSelection(w)}
                        />
                      );
                    })}
                  </Dropdown.Menu>
                </Dropdown>
              </div>
            </div>

            <div className='field m-b-xl'>
              <label>{t('admin.settings.productDefinitions.republishWorkflow')}</label>
              <div className='w-100 thin-bottom-border'>
                <Dropdown
                  className='custom w-100 no-borders p-sm'
                  data-test-pd-workflow
                  text={republishWorkflowName}
                >
                  <Dropdown.Menu>
                    <Dropdown.Item
                      key={0}
                      text={t('admin.settings.productDefinitions.noWorkflow')}
                      onClick={this.republishWorkflowSelection(null)}
                    />
                    {republishWorkflows.map((w, i) => {
                      const { name: fullName } = attributesFor(w);

                      return (
                        <Dropdown.Item
                          key={w.id}
                          text={fullName}
                          onClick={this.republishWorkflowSelection(w)}
                        />
                      );
                    })}
                  </Dropdown.Menu>
                </Dropdown>
              </div>
            </div>

            <div className='field m-b-xl'>
              <label>{t('admin.settings.productDefinitions.description')}</label>
              <textarea
                data-test-pd-description
                value={description}
                onChange={mut('description')}
              />
            </div>

            <div className='m-b-xl'>
              <button
                data-test-submit
                className='ui button p-t-md p-b-md p-l-lg p-r-lg'
                onClick={this.submit}
              >
                {productDefinition
                  ? t('admin.settings.productDefinitions.edit')
                  : t('admin.settings.productDefinitions.add')}
              </button>

              <button
                data-test-pd-cancel
                className='ui button p-t-md p-b-md p-l-lg p-r-lg'
                onClick={this.cancel}
              >
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
    types: [(q) => q.findRecords('applicationType'), buildOptions()],
    workflows: [
      (q) => q.findRecords('workflowDefinition').filter({ attribute: 'type', value: 1 }),
      buildOptions(),
    ],
    rebuildWorkflows: [
      (q) => q.findRecords('workflowDefinition').filter({ attribute: 'type', value: 2 }),
      buildOptions(),
    ],
    republishWorkflows: [
      (q) => q.findRecords('workflowDefinition').filter({ attribute: 'type', value: 3 }),
      buildOptions(),
    ],
  })),
  withLoader(({ types, workflows }) => !types && !workflows)
)(ProductDefinitionForm);
