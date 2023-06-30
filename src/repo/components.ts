import { Component } from "~/models/component";
import makeRepo from "./crud";

const crud = makeRepo<Component>('components')


export default {
  ...crud,
  async getById(idOrSlug: string) {

    const getNestedComponents = async (componentId: string) => {
      const component = await crud.getById(componentId);
      
      if(!component) {
        return null
      }

      const rows: any = await Promise.all(component.rows.map(async (component) => {
        if(component.type === 'component' && component.data['componentId']) {
          return {
            ...component,
            data: {
              ...component.data,
              component: await getNestedComponents(component.data['componentId'])
            }
          }
        }

        return component;
      }));

      return {
        ...component,
        rows
      }
    }


    return getNestedComponents(idOrSlug);
  }
}