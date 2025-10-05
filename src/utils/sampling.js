export function farthestPointSampling(points=[], k=7){
if(points.length<=k) return points
const pick = [ points[Math.floor(Math.random()*points.length)] ]
while(pick.length<k){
let best = null, bestD=-1
for(const p of points){
const dMin = Math.min(...pick.map(q=>((p.x-q.x)**2+(p.y-q.y)**2)))
if(dMin>bestD){ bestD=dMin; best=p }
}
pick.push(best)
}
return pick
}