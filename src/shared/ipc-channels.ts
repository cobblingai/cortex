export const ipcChannels = {
  controller: {
    message: "controller-message",
  },
  view: {
    message: "view-message",
  },
  task: {
    initialize: "task:initialize",
    abort: "task:abort",
  },
};
