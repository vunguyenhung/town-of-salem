/*
3rd Party library imports
 */
const Result = require('folktale/result');
const uuid = require('uuid/v4');

/*
Project file imports
 */
const { isValidLobby } = require('../common');
const { createLobby, addLobby } = require('../lobby-operators');

describe('Lobby Entity add lobby operation', () => {
  it('should return new Lobby with new UUID, empty Users and not Closed when create lobby', () => {
    // GIVEN

    // WHEN
    const actualResult = createLobby();
    const validationResult = isValidLobby(actualResult);

    // THEN
    expect(Result.Ok.hasInstance(validationResult)).toBeTruthy();
  });

  it('should return a new lobby list has new lobby when add a lobby to lobby list', () => {
    // GIVEN
    const firstLobby = {
      id: uuid(),
      users: [],
      isClosed: false,
    };

    const secondLobby = {
      id: uuid(),
      users: [],
      isClosed: false,
    };

    const initialLobbies = [firstLobby, secondLobby];

    // WHEN
    const actualResult = addLobby(initialLobbies);

    // THEN
    expect(actualResult).toHaveLength(3);
    expect(actualResult[0]).toEqual(firstLobby);
    expect(actualResult[1]).toEqual(secondLobby);
    expect(Result.Ok.hasInstance(isValidLobby(actualResult[2]))).toBeTruthy();
  });
});
