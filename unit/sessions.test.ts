import test from 'node:test'
import assert from 'node:assert/strict'
import { gameRegistry } from '../src/games/registry.ts'
import { createSession, answerQuestion, advanceRound, pointsForRound, shuffle, validateQuestions } from '../src/games/shared/session.ts'
import { completionCoins } from '../src/games/shared/rewards.ts'
import { alphabet } from '../src/games/alphabet-match/content.ts'
import { levels } from '../src/data/worlds.ts'
import { calculateStars, completeLevel, createInitialProgress } from '../src/engine/progressEngine.ts'
import type { GameSession, Question } from '../src/games/shared/types.ts'

const rng = () => .37
const game = gameRegistry[1]
function finish(wrongPerRound=0):GameSession {
 let session=createSession(game,rng)
 for(let i=0;i<10;i++){
  const q=session.questions[session.roundIndex]
  const wrong=q.choices.find(c=>c.id!==q.correctAnswerId)!
  for(let n=0;n<wrongPerRound;n++) session=answerQuestion(session,q.id,wrong.id)
  session=answerQuestion(session,q.id,q.correctAnswerId)
  session=advanceRound(session,q.id)
 }
 return session
}
test('sessions start at round one, select ten distinct questions and keep choices valid',()=>{
 for(const definition of Object.values(gameRegistry)){
  const session=createSession(definition,rng)
  assert.equal(session.roundIndex,0);assert.equal(session.status,'playing');assert.equal(session.score,0)
  assert.equal(session.questions.length,10);assert.equal(new Set(session.questions.map(q=>q.id)).size,10)
  for(const q of session.questions){assert.equal(new Set(q.choices.map(c=>c.id)).size,q.choices.length);assert.equal(q.choices.filter(c=>c.id===q.correctAnswerId).length,1)}
 }
})
test('randomness is injectable, shuffles copies and rejects invalid values',()=>{
 const items=[1,2,3,4];assert.deepEqual(shuffle(items,()=>0),[2,3,4,1]);assert.deepEqual(items,[1,2,3,4])
 assert.deepEqual(createSession(game,rng),createSession(game,rng))
 assert.notDeepEqual(createSession(game,()=>0).questions,createSession(game,()=>.99).questions)
 for(const invalid of [-1,1,NaN,Infinity]) assert.throws(()=>shuffle(items,()=>invalid))
})
test('wrong answers do not advance or subtract; only successful feedback advances',()=>{
 let s=createSession(game,rng);const q=s.questions[0]
 assert.equal(advanceRound(s,q.id),s)
 s=answerQuestion(s,q.id,q.choices.find(c=>c.id!==q.correctAnswerId)!.id)
 assert.equal(s.roundIndex,0);assert.equal(s.score,0);assert.equal(s.feedback,'incorrect');assert.equal(s.wrongAttempts,1)
 assert.equal(advanceRound(s,q.id),s)
 s=answerQuestion(s,q.id,q.correctAnswerId);assert.equal(s.status,'round-feedback');assert.equal(s.score,70)
 s=advanceRound(s,q.id);assert.equal(s.roundIndex,1);assert.equal(s.roundWrongAttempts,0);assert.equal(s.selectedAnswerId,null)
})
test('double correct, double advance, invalid and stale input are ignored',()=>{
 let s=createSession(game,rng);const q=s.questions[0]
 assert.equal(answerQuestion(s,q.id,'invalid'),s);assert.equal(answerQuestion(s,'invalid',q.correctAnswerId),s)
 s=answerQuestion(s,q.id,q.correctAnswerId);assert.equal(answerQuestion(s,q.id,q.correctAnswerId),s)
 s=advanceRound(s,q.id);assert.equal(advanceRound(s,q.id),s);assert.equal(answerQuestion(s,q.id,q.correctAnswerId),s)
 assert.equal(s.score,100);assert.equal(s.correctAnswers,1)
})
test('first, second and third+ scoring stays non-negative; perfect bonus is once only',()=>{
 assert.equal(pointsForRound(0),100);assert.equal(pointsForRound(1),70);assert.equal(pointsForRound(2),40);assert.equal(pointsForRound(20),40)
 const perfect=finish();assert.equal(perfect.score,1100);assert.equal(perfect.correctAnswers,10);assert.equal(perfect.firstTryCorrect,10)
 assert.equal(advanceRound(perfect,perfect.questions[9].id),perfect)
 assert.equal(finish(1).score,700);assert.equal(finish(2).score,400);assert.equal(finish(12).score,400)
})
test('all rounds must eventually be correct before completion',()=>{
 const s=createSession(game,rng);assert.equal(s.correctAnswers,0);assert.equal(s.status,'playing')
 const done=finish(2);assert.equal(done.status,'level-complete');assert.equal(done.correctAnswers,10);assert.equal(done.wrongAttempts,20)
})
test('World 1 star boundaries cap at three and low score still unlocks',()=>{
 for(const level of levels.slice(0,5)){
  for(const [score,expected] of [[0,0],[499,0],[500,1],[749,1],[750,2],[949,2],[950,3],[1100,3]]){
   const result=calculateStars(score,level.starThresholds!);assert.equal(result.ok&&result.value,expected)
  }
 }
 const result=completeLevel(createInitialProgress(),{levelId:1,score:400,stars:0,coinsEarned:0})
 assert.ok(result.ok);assert.equal(result.value.levels[0].completed,true)
})
test('star rewards award coins only once and worse replay preserves independent bests',()=>{
 for(const stars of [0,1,2,3] as const){
  assert.equal(completionCoins(stars),[0,30,50,75][stars])
  const first=completeLevel(createInitialProgress(),{levelId:1,score:1100,stars,coinsEarned:completionCoins(stars)})
  assert.ok(first.ok)
  const replay=completeLevel(first.value,{levelId:1,score:400,stars:0,coinsEarned:75})
  assert.ok(replay.ok);assert.equal(replay.value.coins,completionCoins(stars));assert.equal(replay.value.levels[0].bestScore,1100);assert.equal(replay.value.levels[0].stars,stars)
 }
})
test('game data rejects duplicate question/choice IDs and missing content/correct answers',()=>{
 const q=game.questions[0]
 assert.throws(()=>validateQuestions([q,q]))
 assert.throws(()=>validateQuestions([{...q,instruction:''}]))
 assert.throws(()=>validateQuestions([{...q,prompt:undefined} as unknown as Question]))
 assert.throws(()=>validateQuestions([{...q,correctAnswerId:'absent'}]))
 assert.throws(()=>validateQuestions([{...q,choices:[q.choices[0],q.choices[0],q.choices[1]]}]))
 assert.throws(()=>validateQuestions([{...q,choices:q.choices.map(c=>({...c,label:''}))}]))
 assert.throws(()=>createSession({...game,questions:[q]}))
})
for(const definition of Object.values(gameRegistry)) test('content mappings for level '+definition.levelId,()=>{
 validateQuestions(definition.questions)
 for(const q of definition.questions){
  const correct=q.choices.find(c=>c.id===q.correctAnswerId)!
  if(q.prompt.kind==='color'){assert.equal(correct.label,q.prompt.name);assert.ok(correct.color)}
  else if(q.prompt.kind==='count'){assert.equal(correct.number,q.prompt.count);assert.ok(q.prompt.count>=1&&q.prompt.count<=10)}
  else if(q.prompt.kind==='alphabet'){assert.equal(correct.id,alphabet.find(a=>a.letter===(q.prompt as {letter:string}).letter)!.choice.id);assert.ok(correct.visual)}
  else {assert.equal(correct.label,q.prompt.name);assert.equal(correct.visual,q.prompt.visual)}
 }
})
