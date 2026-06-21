'use client';
import {useState} from 'react';
export default function InteractiveFeed({posts}){
 const [items,setItems]=useState(posts);
 const [q,setQ]=useState('');
 const filtered=items.filter(p=>JSON.stringify(p).toLowerCase().includes(q.toLowerCase()));
 async function likePost(id){await fetch(`/api/posts/${id}/likes`,{method:'POST'}); setItems(items.map(p=>p.id===id?{...p,likes:[...(p.likes||{}),{}]}:p));}
 async function comment(id){const t=prompt('Komentar'); if(!t)return; await fetch(`/api/posts/${id}/comments`,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({content:t})}); setItems(items.map(p=>p.id===id?{...p,comments:[...(p.comments||[]),{content:t}]}:p));}
 return <div><input placeholder='Pretraga...' value={q} onChange={e=>setQ(e.target.value)}/>{filtered.map(post=><article key={post.id} className='social-post'><h2>{post.title}</h2><p>{post.content}</p><div className='post-actions'><button onClick={()=>likePost(post.id)}>Like {post.likes?.length||0}</button><button onClick={()=>comment(post.id)}>Komentari {post.comments?.length||0}</button><button onClick={()=>navigator.clipboard.writeText(location.origin+`/#post-${post.id}`)}>Podeli</button></div></article>)}</div>
}
