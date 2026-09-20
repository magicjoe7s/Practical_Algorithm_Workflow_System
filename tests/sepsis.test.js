const test=require("node:test");const assert=require("node:assert/strict");const {evaluate,definitions}=require("../src/sepsis.js");
test("ports all eight sepsis organ definitions",()=>assert.equal(definitions.length,8));
test("requires infection for sepsis classification",()=>{const r=evaluate({infection:false,resuscitated:true,organs:{renal:["anuria"]}});assert.match(r.classification,/not met/);assert.equal(r.affected,1)});
test("excludes cardiovascular findings until resuscitation is confirmed",()=>{const r=evaluate({infection:true,resuscitated:false,organs:{cv:["pressors"]}});assert.equal(r.affected,0);assert.match(r.text,/not counted/)});
test("identifies sepsis dysfunction and shock concern",()=>{const r=evaluate({infection:true,resuscitated:true,organs:{cv:["pressors"],renal:["anuria"]}});assert.equal(r.affected,2);assert.match(r.classification,/potentially met/);assert.match(r.shock,/High/)});
test("two supporting findings elevate configured organs to moderate",()=>{const r=evaluate({infection:true,resuscitated:true,organs:{gi:["feeding","ileus"]}});assert.equal(r.organs.gi.severity,2)});
