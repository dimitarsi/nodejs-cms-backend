import { Field, Groups } from "~/models/storyConfigData";
import crud from "./crud";
import { inspect } from "util";


export default crud("components", {softDelete: false}, (crud, collection) => ({
  ...crud,
  async getById(idOrSlug: string) {

    const getNestedComponents = async (componentId: string) => {
      const component = await crud.getById(componentId);
      
      if(!component) {
        return null
      }

      const rows = await Promise.all(component.rows.map(async (component: Field) => {
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
}))