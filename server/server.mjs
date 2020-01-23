import * as alt from 'alt';

setTimeout(() => {
    alt.Player.all.forEach(p => {
        p.model = "mp_m_freemode_01";
    });
}, 1000);

export function GetClosestPlayer(player, range) {
	if (player === undefined || range === undefined) {
		throw new Error('GetPlayersInRange => pos or range is undefined');
	}
    
    var closestPlayer = null;
    var closestDist = -1;
    
	alt.Player.all.forEach((value) => {
        const dist = Distance(player.pos, value.pos);
		if (closestDist == -1 || dist > closestDist) {
            closestPlayer = player;
            closestDist = dist;
        }
    });
    closestDist = closestDist > 0 ? closestDist : -1;
	return {player: closestPlayer, distance: closestDist};
}

