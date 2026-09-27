import test from 'node:test'
import assert from 'node:assert/strict'
import { createHunt,createMemory,createOrder,finalTenRoundScore,flipMemory,memoryScore,resolveMemory,roundScore,tapHunt,tapOrder } from '../src/games/world2/engine.ts'
import { huntTargets,miniRounds,orderStarts } from '../src/games/world2/content.ts'
import { shapeMatch,shapes } from '../src/games/shape-match/content.ts'
import { promptText } from '../src/audio/voiceManager.ts'
import { completeLevel,createInitialProgress,getHighestUnlockedLevel,isLevelUnlocked } from '../src/engine/progressEngine.ts'

test('Shape Match has ten distinct, accessible four-choice rounds and compatible voice',()=>{
 assert.equal(shapeMatch.questions.length,10);assert.equal(new Set(shapeMatch.questions.map(q=>q.id)).size,10);assert.equal(shapes.length,10)
 for(const q of shapeMatch.questions){assert.equal(q.choices.length,4);assert.equal(q.choices.filter(c=>c.id===q.correctAnswerId).length,1);assert.match(promptText(q),/^Find the .+\.$/)}
})
test('Memory Cards rejects duplicate/third flips, resolves matches and scores mistakes deterministically',()=>{
 let state=createMemory(()=>0);assert.equal(state.cards.length,6);const first=state.cards[0],pair=state.cards.find(c=>c.symbol===first.symbol&&c.id!==first.id)!
 state=flipMemory(state,first.id);assert.equal(flipMemory(state,first.id),state);state=flipMemory(state,pair.id);assert.equal(state.locked,true);assert.equal(flipMemory(state,state.cards[2].id),state)
 state=resolveMemory(state);assert.equal(state.cards.filter(c=>c.matched).length,2);assert.equal(state.mismatches,0);assert.equal(memoryScore(0),1100);assert.equal(memoryScore(9),500)
})
test('Letter Hunt tracks three targets, ignores found taps and never farms them',()=>{
 let state=createHunt('B',()=>0);const targets=state.letters.filter(x=>x.letter==='B');assert.equal(targets.length,3)
 state=tapHunt(state,targets[0].id);assert.equal(tapHunt(state,targets[0].id),state);const wrong=state.letters.find(x=>x.letter!=='B')!;state=tapHunt(state,wrong.id);assert.equal(state.wrong,1)
})
test('Number Order accepts only the next smallest number and preserves wrong choices',()=>{
 let state=createOrder(2,()=>0);state=tapOrder(state,5);assert.equal(state.wrong,1);assert.deepEqual(state.placed,[]);state=tapOrder(state,2);assert.deepEqual(state.placed,[2]);assert.equal(tapOrder(state,2),state)
})
test('Mini Challenge is a ten-round balanced mix with valid unique answers',()=>{
 assert.equal(miniRounds.length,10);assert.deepEqual([...new Set(miniRounds.map(r=>r.kind))].sort(),['letter','number','shape','symbol']);assert.equal(new Set(miniRounds.map(r=>r.id)).size,10)
 for(const round of miniRounds)assert.equal(round.choices.filter(c=>c===round.answer).length,1);assert.equal(huntTargets.length,10);assert.equal(orderStarts.length,10)
})
test('World 2 scoring remains non-negative and reaches standard star thresholds',()=>{
 assert.deepEqual([0,1,2].map(roundScore),[100,70,40]);assert.equal(finalTenRoundScore(1000,0),1100);assert.equal(finalTenRoundScore(400,20),400);assert.ok(memoryScore(1)>=950)
})
test('sequential completion unlocks Levels 6 through 11 and replays cannot add coins',()=>{
 let progress=createInitialProgress('2026-01-01T00:00:00.000Z')
 for(let id=1;id<=10;id++){const result=completeLevel(progress,{levelId:id,score:1100,stars:3,coinsEarned:75});assert.equal(result.ok,true);if(result.ok)progress=result.value;assert.equal(getHighestUnlockedLevel(progress),id+1)}
 assert.equal(isLevelUnlocked(progress,11),true);const coins=progress.coins;const replay=completeLevel(progress,{levelId:10,score:500,stars:1,coinsEarned:75});assert.equal(replay.ok,true);if(replay.ok){assert.equal(replay.value.coins,coins);assert.equal(replay.value.levels[9].bestScore,1100)}
})
