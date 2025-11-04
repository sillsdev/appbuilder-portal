import { DatabaseReads } from '../database';
import { WorkflowType, WorkflowTypeString } from '$lib/prisma';
import type { Environment } from '$lib/workflowTypes';
import { ENVKeys, ProductType } from '$lib/workflowTypes';

export async function addProductPropertiesToEnvironment(productId: string) {
  const product = await DatabaseReads.products.findUniqueOrThrow({
    where: {
      Id: productId
    },
    select: {
      Project: {
        select: {
          Id: true,
          Name: true,
          Description: true,
          Language: true,
          Organization: {
            select: {
              Name: true
            }
          },
          Owner: {
            select: {
              Name: true,
              Email: true
            }
          }
        }
      },
      Properties: true
    }
  });
  const originUrl = process.env.ORIGIN || 'http://localhost:6173';
  const projectUrl = originUrl + '/projects/' + product.Project.Id;

  return {
    [ENVKeys.ORIGIN]: originUrl,
    [ENVKeys.PRODUCT_ID]: productId,
    [ENVKeys.PROJECT_ID]: '' + product.Project.Id,
    [ENVKeys.PROJECT_NAME]: product.Project.Name ?? '',
    [ENVKeys.PROJECT_DESCRIPTION]: product.Project.Description ?? '',
    [ENVKeys.PROJECT_URL]: projectUrl,
    [ENVKeys.PROJECT_LANGUAGE]: product.Project.Language ?? '',
    [ENVKeys.PROJECT_ORGANIZATION]: product.Project.Organization.Name,
    [ENVKeys.PROJECT_OWNER_NAME]: product.Project.Owner.Name,
    [ENVKeys.PROJECT_OWNER_EMAIL]: product.Project.Owner.Email,
    ...(product.Properties ? (JSON.parse(product.Properties).environment ?? {}) : {})
  } as Environment;
}

export async function getWorkflowParameters(
  workflowInstanceId: number,
  scope: 'build' | 'publish'
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
): Promise<any & { environment: Environment }> {
  const instance = await DatabaseReads.workflowInstances.findUniqueOrThrow({
    where: {
      Id: workflowInstanceId
    },
    select: {
      Product: {
        select: {
          ProductDefinition: {
            select: {
              Properties: true,
              Name: true
            }
          }
        }
      },
      WorkflowDefinition: {
        select: {
          Properties: true,
          Type: true,
          ProductType: true
        }
      }
    }
  });
  let environment: Environment = {
    [ENVKeys.WORKFLOW_TYPE]: WorkflowTypeString[instance.WorkflowDefinition.Type],
    [ENVKeys.WORKFLOW_PRODUCT_NAME]: instance.Product.ProductDefinition.Name!
  };

  if (instance.WorkflowDefinition.ProductType !== ProductType.Web) {
    environment[ENVKeys.BUILD_MANAGE_VERSION_CODE] = '1';
    environment[ENVKeys.BUILD_MANAGE_VERSION_NAME] = '1';
    if (
      instance.WorkflowDefinition.Type === WorkflowType.Rebuild ||
      (instance.WorkflowDefinition.ProductType === ProductType.Android_GooglePlay &&
        instance.WorkflowDefinition.Type !== WorkflowType.Republish)
    ) {
      environment[ENVKeys.BUILD_SHARE_APP_LINK] = '1';
    }
  }

  const result: Record<string, string> = {};
  const scoped: Record<string, string> = {};
  Object.entries(JSON.parse(instance.WorkflowDefinition.Properties || '{}')).forEach(([k, v]) => {
    const stringifiedValue = JSON.stringify(v);
    let strKey = k;
    if (strKey === 'environment') {
      // merge environment
      environment = {
        ...environment,
        ...JSON.parse(stringifiedValue)
      };
    }
    // Allow for scoped names so "build:targets" will become "targets"
    // Scoped values should be assigned after non-scoped
    else if (strKey.includes(':')) {
      // Use scoped values for this scope and ignore others
      if (scope && strKey.startsWith(scope + ':')) {
        strKey = strKey.split(':')[1];
        if (strKey === 'environment') {
          scoped[strKey] = stringifiedValue;
        } else {
          scoped[strKey] = JSON.parse(stringifiedValue);
        }
      }
    } else {
      result[strKey] = JSON.parse(stringifiedValue);
    }
  });
  Object.entries(JSON.parse(instance.Product.ProductDefinition.Properties || '{}')).forEach(
    ([k, v]) => {
      const stringifiedValue = JSON.stringify(v);
      let strKey = k;
      if (strKey === 'environment') {
        // merge environment
        environment = {
          ...environment,
          ...JSON.parse(stringifiedValue)
        };
      }
      // Allow for scoped names so "build:targets" will become "targets"
      // Scoped values should be assigned after non-scoped
      else if (strKey.includes(':')) {
        // Use scoped values for this scope and ignore others
        if (scope && strKey.startsWith(scope + ':')) {
          strKey = strKey.split(':')[1];
          if (strKey === 'environment') {
            scoped[strKey] = stringifiedValue;
          } else {
            scoped[strKey] = JSON.parse(stringifiedValue);
          }
        }
      } else {
        result[strKey] = JSON.parse(stringifiedValue);
      }
    }
  );
  Object.entries(scoped).forEach(([k, v]) => {
    if (k === 'environment') {
      environment = {
        ...environment,
        ...JSON.parse(v)
      };
    } else {
      result[k] = v;
    }
  });

  return { ...result, environment: environment };
}
