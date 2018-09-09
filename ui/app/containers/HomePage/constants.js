/*
 * HomeConstants
 * Each action has a corresponding type, which the reducer knows and picks up on.
 * To avoid weird typos between the reducer and the actions, we save them as
 * constants here. We prefix them with 'yourproject/YourComponent' so we avoid
 * reducers accidentally picking up actions they shouldn't.
 *
 * Follow this format:
 * export const YOUR_ACTION_CONSTANT = 'yourproject/YourContainer/YOUR_ACTION_CONSTANT';
 */

export const CHANGE_USERNAME = 'history/Home/CHANGE_USERNAME';
export const LOAD_GALLERIES = 'history/Home/LOAD_GALLERIES';
export const LOAD_GALLERIES_SUCCESS = 'history/Home/LOAD_GALLERIES_SUCCESS';
export const LOAD_GALLERIES_ERROR = 'history/Home/LOAD_GALLERIES_ERROR';
