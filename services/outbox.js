// Applies one outbox operation to the queue/history lists. Pure, so the same
// function drives the optimistic update and the replay over fresh server data.
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

export const replay = (lists, ops) => ops.reduce(applyOp, lists);
