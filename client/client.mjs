import * as alt from 'alt';
import * as game from 'natives';
import * as animations from './animations.mjs';

// Variable to keep track of the player's cuffed state.
var changed = false;
var cuffed = false;
var prevMaleVariation = 0;
var prevFemaleVariation = 0;

// Loading the hashes for female/male MP peds once.
const femaleHash = game.getHashKey("mp_f_freemode_01");
const maleHash = game.getHashKey("mp_m_freemode_01");

function waitUntilCondition(condition, cb, ticks) {
    var interval = alt.setInterval(()=>{
        if (condition != null && condition()) {
            alt.clearInterval(interval);
            cb();
        }
    }, ticks)
}

function ShowHelp(text, bleep) {
    game.beginTextCommandDisplayHelp("STRING")
    game.addTextComponentSubstringPlayerName(text)
    game.endTextCommandDisplayHelp(0, false, bleep, -1)
}

function cuffMyself() {
    const ped = alt.Player.local.scriptID
    animations.playAnimation("on_arrested_victim", () => {            
        game.clearPedTasks(ped);
        if (game.getEntityModel(ped) == femaleHash) { // mp female
            prevFemaleVariation = game.getPedDrawableVariation(ped, 7);
            game.setPedComponentVariation(ped, 7, 25, 0, 0);
        }
        else if (game.getEntityModel(ped) == maleHash) { // mp male
            prevMaleVariation = game.getPedDrawableVariation(ped, 7);
            game.setPedComponentVariation(ped, 7, 41, 0, 0);
        }
        game.setEnableHandcuffs(ped, true)
    },
    ()=>{
        game.clearPedTasks(ped);
        animations.playAnimation("arrested_victim");
        cuffed = true;
        changed = true
    });
}

function releaseMyself() {
    const ped = alt.Player.local.scriptID
    game.clearPedTasks(ped);
    game.setEnableHandcuffs(ped, false);
    game.uncuffPed(ped);
    if (game.getEntityModel(ped) == femaleHash) { // mp female
        game.setPedComponentVariation(ped, 7, prevFemaleVariation, 0, 0);
    }
    else if (game.getEntityModel(ped) == maleHash) { // mp male
        game.setPedComponentVariation(ped, 7, prevMaleVariation, 0, 0);
    }
    cuffed = false;
    changed = true
}

alt.on("anim:cuff", ()=>{
    // (re)set the ped variable, for some reason the one set previously doesn't always work.
    if (!cuffed) { // CUFF THEM
        cuffMyself();
    }
    else { // UNCUFF THEM
        releaseMyself();
    }

    // Change the cuffed state to be the inverse of the previous state.
});

/* Loops */

alt.setInterval(()=>{
    if (cuffed && !animations.isEntityPlayingAnim("arrested_victim")) {
        releaseMyself();
        cuffMyself();
    }
}, 500);

alt.everyTick(() => {
    // (Re)set the ped _AGAIN_!
    // If the player is currently cuffed....
    if (cuffed) {
        const ped = alt.Player.local.scriptID

        game.disableControlAction(0, 69, true) // INPUT_VEH_ATTACK
        game.disableControlAction(0, 92, true) // INPUT_VEH_PASSENGER_ATTACK
        game.disableControlAction(0, 114, true) // INPUT_VEH_FLY_ATTACK
        game.disableControlAction(0, 140, true) // INPUT_MELEE_ATTACK_LIGHT
        game.disableControlAction(0, 141, true) // INPUT_MELEE_ATTACK_HEAVY
        game.disableControlAction(0, 142, true) // INPUT_MELEE_ATTACK_ALTERNATE
        game.disableControlAction(0, 257, true) // INPUT_ATTACK2
        game.disableControlAction(0, 263, true) // INPUT_MELEE_ATTACK1
        game.disableControlAction(0, 264, true) // INPUT_MELEE_ATTACK2
        game.disableControlAction(0, 24, true) // INPUT_ATTACK
        game.disableControlAction(0, 25, true) // INPUT_AIM
    
        game.setPedDropsWeapon(ped)
        
        const veh = game.getVehiclePedIsIn(ped, false) 
        
        if (game.doesEntityExist(veh) && !game.isEntityDead(veh) && game.getPedInVehicleSeat(veh, -1) == ped) {
            
            // Disable A/D on keyboard & Joystick Left/Right on controller.
            game.disableControlAction(0, 59, true)
            
            // Show the !ification, turning off the !ification sound.
            ShowHelp("Your hands are ~r~cuffed~s~, you can't stear!", false)
        }
    }
});


function serveJusticePattyMayoStyle() {

}


/* Keybinds */

alt.on('keyup', (key) => {
    if (key == 'E'.charCodeAt(0)) {
        alt.emit("anim:cuff");
    }
    if (key == 'F'.charCodeAt(0)) {
        game.setEntityCoords(alt.Player.local.scriptID, 0.0, 0.0, 80.0, false, false, false, false);
    }
});
