import crud from "./crud"

const repo = crud("stories", { softDelete: false }, (crud, _collection) => {
  return {
    ...crud,
    create(data) {
      return crud.create({
        createOn: new Date(),
        updatedOn: new Date(),
        isActive: true,
        ...data,
      });
    },
    update(id: string, data) {
      return crud.update(id, {
        updatedOn: new Date(),
        ...data,
      });
    },
  };
});

export default repo