import assert from 'node:assert/strict'
import test from 'node:test'
import {completeLevel,createInitialProgress} from '../src/engine/progressEngine.ts'
import {addition} from '../src/games/world3/addition/content.ts'
import {subtraction} from '../src/games/world3/subtraction/content.ts'
import {animalHome} from '../src/games/world3/animal-home/content.ts'
import {foodSort,foods} from '../src/games/world3/food-sort/content.ts'
import {shapePuzzle} from '../src/games/world3/shape-puzzle/content.ts'

const games=[addition,subtraction,animalHome,foodSort,shapePuzzle]

test('Cloud Kingdom supplies ten valid, unique rounds for every level',()=>{
 for(const game of games){
  assert.equal(game.questions.length,10)
  assert.equal(new Set(game.questions.map(question=>question.id)).size,10)
  for(const question of game.questions){
   assert.ok(question.choices.length>=2&&question.choices.length<=4)
   assert.equal(question.choices.filter(choice=>choice.id===question.correctAnswerId).length,1)
   assert.equal(new Set(question.choices.map(choice=>choice.id)).size,question.choices.length)
  }
 }
})

test('addition and subtraction content has correct child-safe arithmetic',()=>{
 for(const question of addition.questions){if(question.prompt.kind!=='addition')throw Error('wrong prompt');assert.ok(question.prompt.left>=0&&question.prompt.left<=5);assert.ok(question.prompt.right>=0&&question.prompt.right<=5);assert.ok(question.prompt.left+question.prompt.right<=10);assert.equal(question.correctAnswerId,String(question.prompt.left+question.prompt.right))}
 for(const question of subtraction.questions){if(question.prompt.kind!=='subtraction')throw Error('wrong prompt');assert.ok(question.prompt.right<=question.prompt.left);assert.equal(question.correctAnswerId,String(question.prompt.left-question.prompt.right))}
})

test('animal homes, food categories and puzzle pieces map to their visible answers',()=>{
 const expected=new Map([['bird','nest'],['dog','doghouse'],['rabbit','burrow'],['fish','water'],['frog','pond'],['lion','den'],['horse','stable'],['duck','pond'],['sheep','barn'],['cat','house']])
 for(const question of animalHome.questions){if(question.prompt.kind!=='animal-home')throw Error('wrong prompt');assert.equal(question.correctAnswerId,expected.get(question.prompt.animal))}
 assert.equal(foods.filter(([,category])=>category==='Fruit').length,5);assert.equal(foods.filter(([,category])=>category==='Vegetable').length,5)
 for(const question of foodSort.questions){if(question.prompt.kind!=='food-sort')throw Error('wrong prompt');assert.equal(question.correctAnswerId,question.prompt.category)}
 for(const question of shapePuzzle.questions){if(question.prompt.kind!=='puzzle')throw Error('wrong prompt');assert.equal(question.correctAnswerId,question.prompt.missing)}
})

test('finishing Cloud Kingdom unlocks Level 16 once and replay cannot farm coins',()=>{
 let progress=createInitialProgress()
 for(let id=1;id<=15;id++){const result=completeLevel(progress,{levelId:id,score:1100,stars:3,coinsEarned:75});if(!result.ok)throw Error('completion failed');progress=result.value}
 assert.equal(progress.levels[15].completed,false);assert.equal(progress.levels[14].completed,true);assert.equal(progress.coins,1125)
 const replay=completeLevel(progress,{levelId:15,score:900,stars:2,coinsEarned:50});if(!replay.ok)throw Error('replay failed');assert.equal(replay.value.coins,1125);assert.equal(replay.value.levels[14].bestScore,1100);assert.equal(replay.value.levels[14].stars,3)
})
