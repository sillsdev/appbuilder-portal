import * as React from 'react';
import { compose } from 'recompose';
import { Checkbox, Dropdown } from 'semantic-ui-react';
import { withTranslations, i18nProps } from '@lib/i18n';
import { isEmpty } from '@lib/collection';
import * as toast from '@lib/toast';
import { WorkflowDefinitionAttributes } from '@data/models/workflow-definition';
import {
  query,
  buildOptions,
  withLoader,
  attributesFor,
  StoreTypeResource,
  WorkflowDefinitionResource,
} from '@data';
import { Mut, Toggle, mutCreator, toggleCreator } from 'react-state-helpers';

interface IOwnProps {
  workflowDefinition: WorkflowDefinitionResource;
  storeType: StoreTypeResource;
  storeTypes: StoreTypeResource[];
  onSubmit: (attributes: WorkflowDefinitionAttributes, relationships: any) => void;
  onCancel: () => void;
}

interface IState {
  name?: string;
  description?: string;
  storeType?: StoreTypeResource;
  storeTypeError?: string;
  workflowScheme?: string;
  workflowBusinessFlow?: string;
  properties?: string;
  enabled?: boolean;
  type?: number;
  workflowTypeError?: string;
}

type IProps = i18nProps & IOwnProps;

class WorkflowDefinitionForm extends React.Component<IProps, IState> {
  mut: Mut;
  toggle: Toggle;
  constructor(props: IProps) {
    super(props);

    const { workflowDefinition, storeType } = props;

    const {
      name,
      description,
      workflowScheme,
      workflowBusinessFlow,
      properties,
      enabled,
      type,
    } = attributesFor(workflowDefinition);

    this.mut = mutCreator(this);
    this.toggle = toggleCreator(this);

    this.state = {
      name: name || '',
      description: description || '',
      workflowScheme: workflowScheme || '',
      workflowBusinessFlow: workflowBusinessFlow || '',
      properties: properties || '',
      enabled: enabled !== undefined ? enabled : true,
      storeType: storeType || null,
      storeTypeError: '',
      type: type || null,
      workflowTypeError: '',
    };
  }

  isValidForm = () => {
    const { storeType, type } = this.state;
    const { t } = this.props;
    const storeTypeError = isEmpty(storeType)
      ? t('admin.settings.workflowDefinitions.emptyStoreType')
      : '';
    this.setState({ storeTypeError });
    const workflowTypeError = !type
      ? t('admin.settings.workflowDefinitions.emptyWorkflowType')
      : '';
    this.setState({ workflowTypeError });
    return !isEmpty(storeType) && type;
  };

  submit = async (e) => {
    e.preventDefault();

    const { onSubmit } = this.props;
    const {
      name,
      description,
      workflowScheme,
      workflowBusinessFlow,
      properties,
      enabled,
      storeType,
      type,
    } = this.state;

    if (this.isValidForm()) {
      try {
        await onSubmit(
          {
            name,
            description,
            workflowScheme,
            workflowBusinessFlow,
            properties,
            enabled,
            type,
          },
          {
            storeType,
          }
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

  storeTypeSelection = (storeType) => (e) => {
    this.setState({ storeType });
  };

  workflowTypeSelection = (type) => (e) => {
    this.setState({ type });
  };
  render() {
    const { mut, toggle } = this;
    const validTypes = [1, 2, 3];

    const {
      name,
      description,
      workflowScheme,
      workflowBusinessFlow,
      properties,
      enabled,
      storeType,
      storeTypeError,
      type,
      workflowTypeError,
    } = this.state;

    const { t, storeTypes, workflowDefinition } = this.props;

    const { name: storeTypeName } = attributesFor(storeType);

    return (
      <>
        <h2>
          {t(
            workflowDefinition
              ? 'admin.settings.workflowDefinitions.edit'
              : 'admin.settings.workflowDefinitions.add'
          )}
        </h2>
        <div className='flex w-60'>
          <form data-test-form className='ui form flex-grow'>
            <div className='field m-b-xl'>
              <label>{t('admin.settings.workflowDefinitions.name')}</label>
              <input data-test-wf-name type='text' value={name || ''} onChange={mut('name')} />
            </div>

            <div className='field m-b-xl'>
              <label>{t('admin.settings.workflowDefinitions.storeType')}</label>
              <div className='w-100 thin-bottom-border'>
                <Dropdown
                  className='custom w-100 no-borders p-sm'
                  data-test-wf-storetype
                  text={storeTypeName}
                >
                  <Dropdown.Menu>
                    {storeTypes.map((s) => {
                      const { name: typeName } = attributesFor(s);

                      return (
                        <Dropdown.Item
                          key={s.id}
                          text={typeName}
                          onClick={this.storeTypeSelection(s)}
                        />
                      );
                    })}
                  </Dropdown.Menu>
                </Dropdown>
              </div>
              <div className='error'>{storeTypeError}</div>
            </div>

            <div className='field m-b-xl'>
              <label>{t('admin.settings.workflowDefinitions.workflowType')}</label>
              <div className='w-100 thin-bottom-border'>
                <Dropdown
                  className='custom w-100 no-borders p-sm'
                  data-test-wf-workflowtype
                  text={
                    type
                      ? t(`admin.settings.workflowDefinitions.workflowTypes.${type.toString()}`)
                      : ''
                  }
                >
                  <Dropdown.Menu>
                    {validTypes.map((s) => {
                      return (
                        <Dropdown.Item
                          key={s}
                          text={t(
                            `admin.settings.workflowDefinitions.workflowTypes.${s.toString()}`
                          )}
                          onClick={this.workflowTypeSelection(s)}
                        />
                      );
                    })}
                  </Dropdown.Menu>
                </Dropdown>
              </div>
              <div className='error'>{workflowTypeError}</div>
            </div>

            <div className='field m-b-xl'>
              <label>{t('admin.settings.workflowDefinitions.description')}</label>
              <input
                data-test-wf-description
                type='text'
                value={description || ''}
                onChange={mut('description')}
              />
            </div>

            <div className='field m-b-xl'>
              <label>{t('admin.settings.workflowDefinitions.workflowScheme')}</label>
              <input
                data-test-wf-workflow-scheme
                type='text'
                value={workflowScheme || ''}
                onChange={mut('workflowScheme')}
              />
            </div>

            <div className='field m-b-xl'>
              <label>{t('admin.settings.workflowDefinitions.workflowBusinessFlow')}</label>
              <input
                data-test-wf-workflow-business-flow
                type='text'
                value={workflowBusinessFlow || ''}
                onChange={mut('workflowBusinessFlow')}
              />
            </div>

            <div className='field m-b-xl'>
              <label>{t('admin.settings.workflowDefinitions.properties')}</label>
              <textarea
                data-test-wf-properties
                type='text'
                value={properties}
                onChange={mut('properties')}
              />
            </div>

            <div className='flex m-b-xl'>
              <div className='flex-row align-items-center'>
                <div className='p-r-lg'>
                  <h3>{t('admin.settings.workflowDefinitions.enabled')}</h3>
                  <p className='input-info'>
                    {t('admin.settings.workflowDefinitions.enabledDescription')}
                  </p>
                </div>
                <div>
                  <Checkbox
                    data-test-wf-enabled
                    toggle
                    name='enabled'
                    defaultChecked={enabled}
                    onChange={toggle('enabled')}
                  />
                </div>
              </div>
            </div>

            <div className='m-b-xl'>
              <button
                data-test-wf-submit
                className='ui button p-t-md p-b-md p-l-lg p-r-lg'
                onClick={this.submit}
              >
                {workflowDefinition ? t('common.save') : t('common.add')}
              </button>

              <button
                data-test-wf-cancel
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
    storeTypes: [(q) => q.findRecords('storeType'), buildOptions()],
  })),
  withLoader(({ storeTypes }) => !storeTypes)
)(WorkflowDefinitionForm);
