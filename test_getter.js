const state = {
  currentId: null,
  projects: {},
  get messages() {
    return this.currentId ? this.projects[this.currentId] : [];
  }
};
console.log(state.messages); // []
const newState = { ...state, currentId: 1, projects: { 1: ['hello'] } };
console.log(newState.messages); // []! Because state.messages was evaluated and copied!
