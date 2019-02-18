export const getPage = ({ pageSize, list = [], page }) => list.slice((page - 1) * pageSize, page * pageSize);

export const insertPage = ({
  pageSize, list = [], page, insert,
}) => {
  const newList = list.slice();
  const startPos = (page - 1) * pageSize;
  if (startPos < 0) {
    return newList;
  }

  newList.splice(startPos, pageSize, ...insert);

  return newList;
};
