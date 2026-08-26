function quickSort(items, compareFn) {
  if (items.length <= 1) return items;

  const array = [...items];

  function partition(arr, low, high) {
    const pivot = arr[high];
    let i = low - 1;
    for (let j = low; j < high; j++) {
      if (compareFn(arr[j], pivot) <= 0) {
        i++;
        [arr[i], arr[j]] = [arr[j], arr[i]];
      }
    }
    [arr[i + 1], arr[high]] = [arr[high], arr[i + 1]];
    return i + 1;
  }

  function sort(arr, low, high) {
    if (low < high) {
      const pivotIndex = partition(arr, low, high);
      sort(arr, low, pivotIndex - 1);
      sort(arr, pivotIndex + 1, high);
    }
  }

  sort(array, 0, array.length - 1);
  return array;
}

function mergeSort(items, compareFn) {
  if (items.length <= 1) return items;

  const middle = Math.floor(items.length / 2);
  const left = mergeSort(items.slice(0, middle), compareFn);
  const right = mergeSort(items.slice(middle), compareFn);

  return merge(left, right, compareFn);
}

function merge(left, right, compareFn) {
  const result = [];
  let i = 0;
  let j = 0;

  while (i < left.length && j < right.length) {
    if (compareFn(left[i], right[j]) <= 0) {
      result.push(left[i]);
      i++;
    } else {
      result.push(right[j]);
      j++;
    }
  }

  return result.concat(left.slice(i)).concat(right.slice(j));
}

function insertionSortByName(items) {
  const array = [...items];

  for (let i = 1; i < array.length; i++) {
    const current = array[i];
    const currentName = current.name.toLowerCase();
    let j = i - 1;

    while (j >= 0 && array[j].name.toLowerCase() > currentName) {
      array[j + 1] = array[j];
      j--;
    }

    array[j + 1] = current;
  }

  return array;
}

function searchTrainsByName(items, query) {
  const term = query.trim().toLowerCase();
  if (!term) return [];

  const sorted = insertionSortByName(items);
  return sorted.filter((item) => item.name.toLowerCase().includes(term));
}

function binarySearchByName(sortedItems, name) {
  let low = 0;
  let high = sortedItems.length - 1;
  const target = name.toLowerCase();

  while (low <= high) {
    const mid = Math.floor((low + high) / 2);
    const current = sortedItems[mid].name.toLowerCase();

    if (current === target) return sortedItems[mid];
    if (current < target) low = mid + 1;
    else high = mid - 1;
  }

  return null;
}

module.exports = { quickSort, mergeSort, binarySearchByName, insertionSortByName, searchTrainsByName };