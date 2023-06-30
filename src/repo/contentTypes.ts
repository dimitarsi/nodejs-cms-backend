import { StoryConfigData } from "~/models/contentType";
import makeRepo from "./crud";
import { WithId } from "mongodb";
import components from "./components";
import { Field } from "~/models/component";

const crud = makeRepo("contentTypes", { softDelete: true });

export default {
  ...crud,
  async getById(idOrSlug: string) {
    const config = await crud.getById(idOrSlug) as WithId<StoryConfigData>;

    const getWithComponents = async (row: Field) => {
      if(row.type === 'component' && row.data['componentId']) {
        const component = await components.getById(row.data['componentId'].toString())

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
}
