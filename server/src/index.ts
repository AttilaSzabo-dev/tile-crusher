import express from 'express';import cors from 'cors';import dotenv from 'dotenv';import{MongoClient}from'mongodb';dotenv.config();
const app=express();app.use(cors());app.use(express.json({limit:'1mb'}));
const port=Number(process.env.PORT||3001);const uri=process.env.MONGODB_URI;const dbName=process.env.MONGODB_DB||'tile_crusher';
let collection:any=null;if(uri){const client=new MongoClient(uri);client.connect().then(()=>{collection=client.db(dbName).collection('saves');console.log('MongoDB connected')}).catch(e=>console.error('MongoDB connection failed',e.message))}else console.warn('MONGODB_URI is not configured; saves are disabled.');
app.get('/api/health',(_,res)=>res.json({ok:true,mongodb:!!collection}));
app.get('/api/save/:playerId',async(req,res)=>{if(!collection)return res.status(503).json({error:'Database not configured'});const doc=await collection.findOne({_id:req.params.playerId});if(!doc)return res.status(404).json({error:'No save found'});res.json(doc.state)});
app.put('/api/save/:playerId',async(req,res)=>{if(!collection)return res.status(503).json({error:'Database not configured'});const state=req.body;await collection.updateOne({_id:req.params.playerId},{$set:{state,updatedAt:new Date()}},{upsert:true});res.json({ok:true})});
app.listen(port,()=>console.log(`Tile Crusher API listening on :${port}`));
