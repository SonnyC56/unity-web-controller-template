import state from "./state.js";

/**
 * Removes the first element in an array that returns value of true from the given expression
 *
 * @param {array} arr an array
 * @param {function(element, index)} expr an expression that returns true if given element should be removed
 * @returns {boolean} true if a matching element was found and removed, false if no matching element was found
 */
export const removeOneInPlace = (arr, expr) =>
  !arr.every(
    (item, index) => !arr.splice(index, expr(item, index) ? 1 : 0).length
  );

export const broadcastQueuePositions = () => {
  state.controlQueue.forEach((client, index) => {
    client.client.send(
      JSON.stringify({
        type: "queue",
        position: index,
        controlQueueLength: state.controlQueue.length,
      })
    );
  });
  state.adminClients.forEach((client) => {
    client.client.send(
      JSON.stringify({
        type: "queue",
        position: -1,
        controlQueueLength: state.controlQueue.length,
      })
    );
  });
};

export const serializeClientArray = (array) => {
  return array.map((i) => {
    return { name: i.name, uuid: i.uuid };
  });
};
