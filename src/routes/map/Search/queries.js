export let SEARCH_BY_COUNTRY = 'query TournamentsByCountry($cCode: String!, $perPage: Int!, $after: Timestamp!, $before: Timestamp, $state: String, $game: [ID]) {' +
    '            tournaments(query: {perPage: $perPage, filter: {countryCode: $cCode, afterDate: $after, beforeDate: $before, videogameIds: $game, addrState: $state}})' +
    '            {' +
    '                nodes {' +
    '                  name' +
    '                  venueAddress' +
    '                  startAt' +
    '                  primaryContact' +
    '                  url' +
    '                  numAttendees' +
    '                  state' +
    '                  isOnline' +
    '                  countryCode' +
    '                   images(type: "profile") {' +
    '                      url' +
    '                   }' +
    '                  participants(query: {perPage: 499}) {' +
    '                    nodes {' +
    '                      gamerTag' +
    '                    }' +
    '                  }' +
    '                }' +
    '              }' +
    '            }';

export let SEARCH_BY_LOCATION = 'query TournamentsByLocation($coordinates: String!, $radius: String!, $perPage: Int!, $after: Timestamp!, $before: Timestamp!, $game: [ID]) {' +
    '              tournaments(' +
    '                query: {perPage: $perPage, filter: {location: {distanceFrom: $coordinates, distance: $radius}, afterDate: $after, beforeDate: $before, videogameIds: $game}}' +
    '              ) {' +
    '                nodes {' +
    '                  name' +
    '                  venueAddress' +
    '                  startAt' +
    '                  primaryContact' +
    '                  url' +
    '                  numAttendees' +
    '                  state' +
    '                  isOnline' +
    '                  countryCode' +
    '                  images(type: "profile") {' +
    '                    url' +
    '                  }' +
    '                  participants(query: {}) {' +
    '                    nodes {' +
    '                      gamerTag' +
    '                    }' +
    '                  }' +
    '                }' +
    '              }' +
    '            }' +
    '            ';

export let SEARCH_BY_PLAYER = 'query tournamentByPlayerID($id: ID!) {' +
    '  player(id: $id) {' +
    '    gamerTag' +
    '    user {' +
    '      slug' +
    '      tournaments(query: {filter: {upcoming: true}}) {' +
    '        nodes {' +
    '          name' +
    '          venueAddress' +
    '          startAt' +
    '          primaryContact' +
    '          url' +
    '          numAttendees' +
    '          state' +
    '          isOnline' +
    '          countryCode' +
    '          images(type: "profile") {' +
    '            url' +
    '          }' +
    '          participants(query: {}) {' +
    '            nodes {' +
    '              gamerTag' +
    '            }' +
    '          }' +
    '        }' +
    '      }' +
    '    }' +
    '  }' +
    '}';

export let CHECK_USER_EXISTS = 'query checkUser($id: ID!) {\n' +
    '  player(id: $id) {\n' +
    '    gamerTag\n' +
    '    prefix\n' +
    '    user {\n' +
    '      slug\n' +
    '    }\n' +
    '  }\n' +
    '}\n '