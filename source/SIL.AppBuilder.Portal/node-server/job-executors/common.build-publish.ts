import { prisma } from 'sil.appbuilder.portal.common';
import { WorkflowTypeString } from 'sil.appbuilder.portal.common/prisma';
import { Environment, ENVKeys } from 'sil.appbuilder.portal.common/workflow';

export async function addProductPropertiesToEnvironment(productId: string) {
  const product = await prisma.products.findUnique({
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
  const uiUrl = process.env.UI_URL || 'http://localhost:5173';
  const projectUrl = uiUrl + '/projects/' + product.Project.Id;

  return {
    [ENVKeys.UI_URL]: uiUrl,
    [ENVKeys.PRODUCT_ID]: productId,
    [ENVKeys.PROJECT_ID]: '' + product.Project.Id,
    [ENVKeys.PROJECT_NAME]: product.Project.Name,
    [ENVKeys.PROJECT_DESCRIPTION]: product.Project.Description,
    [ENVKeys.PROJECT_URL]: projectUrl,
    [ENVKeys.PROJECT_LANGUAGE]: product.Project.Language,
    [ENVKeys.PROJECT_ORGANIZATION]: product.Project.Organization.Name,
    [ENVKeys.PROJECT_OWNER_NAME]: product.Project.Owner.Name,
    [ENVKeys.PROJECT_OWNER_EMAIL]: product.Project.Owner.Email,
    ...(product.Properties ? JSON.parse(product.Properties).environment ?? {} : {})
  } as Environment;
}

export async function getWorkflowParameters(workflowInstanceId: number, scope?: string) {
  const instance = await prisma.workflowInstances.findUnique({
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
          Type: true
        }
      }
    }
  });
  let environment: Environment = {
    WORKFLOW_TYPE: WorkflowTypeString[instance.WorkflowDefinition.Type],
    WORKFLOW_PRODUCT_NAME: instance.Product.ProductDefinition.Name
  };
  
  const result: { [key: string]: string } = {};
  const scoped: { [key: string]: string } = {};
  Object.entries(JSON.parse(instance.WorkflowDefinition.Properties ?? '{}')).forEach(([k, v]) => {
    const strValue = JSON.stringify(v);
    let strKey = k;
    if (strKey === 'environment') {
      // merge environment
      environment = {
        ...environment,
        ...JSON.parse(strValue)
      };
    }
    // Allow for scoped names so "build:targets" will become "targets"
    // Scoped values should be assigned after non-scoped
    else if (strKey.includes(':')) {
      // Use scoped values for this scope and ignore others
      if (scope && strKey.startsWith(scope + ':')) {
        strKey = strKey.split(':')[1];
        scoped[strKey] = strValue;
      }
    } else {
      result[strKey] = strValue;
    }
  });
  Object.entries(JSON.parse(instance.Product.ProductDefinition.Properties ?? '{}')).forEach(([k, v]) => {
    const strValue = JSON.stringify(v);
    let strKey = k;
    if (strKey === 'environment') {
      // merge environment
      environment = {
        ...environment,
        ...JSON.parse(strValue)
      };
    }
    // Allow for scoped names so "build:targets" will become "targets"
    // Scoped values should be assigned after non-scoped
    else if (strKey.includes(':')) {
      // Use scoped values for this scope and ignore others
      if (scope && strKey.startsWith(scope + ':')) {
        strKey = strKey.split(':')[1];
        scoped[strKey] = strValue;
      }
    } else {
      result[strKey] = strValue;
    }
  });
  Object.entries(scoped).forEach(([k, v]) => {
    if (k === 'environment') {
      environment = {
        ...environment,
        ...JSON.parse(v)
      }
    }
    else {
      result[k] = v;
    }
  });

  return { ...result, environment: environment };
}
