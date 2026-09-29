/**
 * @file Pure reducers that apply queued (not yet synced) actions to the
 * incident lists.
 * @author Kyle Meredith
 */

/**
 * Applies one outbox operation to the queue/history lists. Pure, so the same
 * function drives the optimistic update and the replay over fresh server data.
 * @param {{incidents: object[], history: object[]}} lists
 * @param {{type: string, incidentId?: string, at: number}} op
 * @returns {{incidents: object[], history: object[]}} New lists; the input is
 *   returned unchanged when the op doesn't apply.
 */
export function applyOp(lists, op) {
  switch (op.type) {
    case 'acknowledge': {
      const item = lists.incidents.find((incident) => incident.incidentId === op.incidentId);
      if (!item) return lists;
      return {
        incidents: lists.incidents.filter((incident) => incident !== item),
        history: [
          { ...item, resolvedAt: op.at },
          ...lists.history.filter((incident) => incident.incidentId !== op.incidentId),
        ],
      };
    }
    case 'delete':
      return {
        ...lists,
        history: lists.history.filter((incident) => incident.incidentId !== op.incidentId),
      };
    case 'deleteAll':
      return { ...lists, history: [] };
    default:
      return lists;
  }
}

/**
 * Applies every pending op, in order, on top of a server snapshot.
 * @param {{incidents: object[], history: object[]}} lists
 * @param {object[]} ops
 */
export const replay =(lists, ops) => ops.reduce((current, op) => applyOp(current, op), lists);
