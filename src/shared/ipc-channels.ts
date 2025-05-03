export const ipcChannels = {
  controller: {
    message: "controller-message",
  },
  view: {
    message: "view-message",
  },
  task: {
    newTask: "task:new-task",
    abort: "task:abort",
  },
};
