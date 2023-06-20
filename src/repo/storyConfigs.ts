import { Field, StoryConfigData } from "~/models/storyConfigData";
import crud from "./crud";
import { WithId } from "mongodb";
import components from "./components";
import { inspect } from "util";

export const dbName: string = "storiesConfig";

export default crud(dbName, { softDelete: true }, (crud, collection) => ({
  ...crud,
  async getById(idOrSlug: string) {
    const config = await crud.getById(idOrSlug) as WithId<StoryConfigData>;

    const getWithComponents = async (row: Field) => {
      if(row.type === 'component' && row.data['componentId']) {
        console.log('>> Fetch component', row.data['componentId'].toString());
        const component = await components.getById(row.data['componentId'].toString())

        console.log(inspect(component, {depth: 99}))

        return {
          ...row,
          component
        }
      }

      return row;
    }

    const fields = await Promise.all(config.fields.map(async (group) => {
      const rows = await Promise.all(group.rows.map((row) => {
        return getWithComponents(row);
      }))

      return {
        ...group,
        rows
      };
    }));

    return {
      ...config,
      fields
    }
  }
}))
