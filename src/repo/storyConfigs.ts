import crud from "./crud";

export const dbName: string = "storiesConfig";

export default crud(dbName, { softDelete: true })
