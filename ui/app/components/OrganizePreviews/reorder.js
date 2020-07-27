const reorder = (list, startIndex, endIndex) => {
  const result = Array.from(list);
  const [removed] = result.splice(startIndex, 1);
  result.splice(endIndex, 0, removed);

  return result;
};

const ungroupToItems = columnItems => {
  const items = columnItems.column1
    .concat(columnItems.column2)
    .concat(columnItems.column3)
    .concat(columnItems.column4);
  return items;
};

export default function reorderOnRelease({ columnItems, source, destination }) {
  const current = [...columnItems[source.droppableId]];
  const next = [...columnItems[destination.droppableId]];
  const target = current[source.index];

  // moving to same list
  if (source.droppableId === destination.droppableId) {
    const reordered = reorder(current, source.index, destination.index);
    const result = {
      ...columnItems,
      [source.droppableId]: reordered,
    };

    return ungroupToItems(result);
  }

  // moving to different list

  // remove from original
  current.splice(source.index, 1);
  // insert into next
  next.splice(destination.index, 0, target);

  const result = {
    ...columnItems,
    [source.droppableId]: current,
    [destination.droppableId]: next,
  };

  return ungroupToItems(result);
}
