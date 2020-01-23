import * as alt from 'alt';
import * as game from 'natives';

const anims = {
    "on_arrested_victim": {
        dict: "mp_arresting",
        anim: "arrested_spin_l_0",
        flags: 0, // Freeze
    },
    "arrested_victim": {
        dict: "mp_arresting",
        anim: "idle",
        flags: 49, // Allow bottom movement.
    }
}

function waitUntilCondition(condition, cb, ticks) {
    var interval = alt.setInterval(()=>{
        if (condition != null && condition()) {
            alt.clearInterval(interval);
            cb();
        }
    }, ticks)
}

export function playAnimation(animationKey, onStart, onEnd) {
    const table = anims[animationKey];
    const ped = alt.Player.local.scriptID;
    game.clearPedTasksImmediately(ped);
    if (table != null) {
        const dict = table.dict;
        const anim = table.anim;
        const flags = table.flags;
        game.requestAnimDict(dict);
        const conditionOne = () => {return game.hasAnimDictLoaded(dict)};
        waitUntilCondition(conditionOne, () => {
            if (onStart != null) {
                onStart();
            }
            game.taskPlayAnim(ped, dict, anim, 8.0, -8, -1, flags, 0, 0, 0, 0);
            if (onEnd != null) {
                const conditionTwo = () => {return !isEntityPlayingAnim(animationKey)};
                waitUntilCondition(conditionTwo, () => {
                    onEnd();
                }, 100);
            }
        }, 100);
    }
}

export function isEntityPlayingAnim(animationKey) {
    const table = anims[animationKey];
    const ped = alt.Player.local.scriptID;
    if (table != null) {
        const dict = table.dict;
        const anim = table.anim;
        return game.isEntityPlayingAnim(alt.Player.local.scriptID, dict, anim, 3);
    }
    else {
        return false;
    }
}