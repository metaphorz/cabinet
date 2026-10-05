"""Software-only spatial diagnostic when a browser/GPU cannot be launched.
This verifies placement and camera composition; it is not a WebGL screenshot.
"""
import json,math
from pathlib import Path
import numpy as np
from PIL import Image
from numba import njit
root=Path(__file__).resolve().parents[1]
data=json.loads((root/'validation/scene.json').read_text())
W,H=1280,800
ref=Image.open(root/'dist/assets/reference.png').convert('RGB')
textures=[];texture_ids={}
for art in data['paintings']:
    key=art.get('image') or f"crop-{art['id']}"
    if art.get('image'): im=Image.open(root/'dist'/art['image']).convert('RGB')
    else:
        x,y,w,h=art['crop'];im=ref.crop((x,y,x+w,y+h))
    im=im.resize((512,512));texture_ids[key]=len(textures);textures.append(np.array(im,dtype=np.uint8))
tex=np.stack(textures)
yaw,pitch=-.43,.19
forward=np.array([-math.sin(yaw)*math.cos(pitch),math.sin(pitch),-math.cos(yaw)*math.cos(pitch)])
right=np.cross(forward,[0,1,0]);right/=np.linalg.norm(right);up=np.cross(right,forward)
view=np.stack([right,up,forward]);eye=np.array([-5.7,1.72,5.85])
focal=H/(2*math.tan(math.radians(62)/2))
@njit
def aces(x):
 return min(1.,max(0.,(x*(2.51*x+.03))/(x*(2.43*x+.59)+.14)))**(1/2.2)
@njit
def triangle(v,uv,color,texture_id,lighting,buffer,depth,tex,focal):
    xx=np.empty(3);yy=np.empty(3)
    for i in range(3):
        xx[i]=W/2+v[i,0]/v[i,2]*focal; yy[i]=H/2-v[i,1]/v[i,2]*focal
    loX=max(0,int(np.floor(min(xx))));hiX=min(W-1,int(np.ceil(max(xx))));loY=max(0,int(np.floor(min(yy))));hiY=min(H-1,int(np.ceil(max(yy))))
    if loX>hiX or loY>hiY:return
    den=(yy[1]-yy[2])*(xx[0]-xx[2])+(xx[2]-xx[1])*(yy[0]-yy[2])
    if abs(den)<1e-8:return
    invz=1/v[:,2]
    for y in range(loY,hiY+1):
      for x in range(loX,hiX+1):
        b0=((yy[1]-yy[2])*(x+.5-xx[2])+(xx[2]-xx[1])*(y+.5-yy[2]))/den
        b1=((yy[2]-yy[0])*(x+.5-xx[2])+(xx[0]-xx[2])*(y+.5-yy[2]))/den
        b2=1-b0-b1
        if b0<0 or b1<0 or b2<0:continue
        reciprocal=b0*invz[0]+b1*invz[1]+b2*invz[2]
        z=1/reciprocal
        if z>=depth[y,x]:continue
        depth[y,x]=z
        u=(b0*uv[0,0]*invz[0]+b1*uv[1,0]*invz[1]+b2*uv[2,0]*invz[2])*z
        t=(b0*uv[0,1]*invz[0]+b1*uv[1,1]*invz[1]+b2*uv[2,1]*invz[2])*z
        for k in range(3):
          c=color[k]
          if texture_id>=0:
            tx=max(0,min(511,int(u*511)));ty=max(0,min(511,int((1-t)*511)))
            c*=float(tex[texture_id,ty,tx,k]/255.)**2.2
          buffer[y,x,k]=int(255*aces(c*lighting))
@njit
def draw(vertices,uvs,indices,color,tid,lighting,buffer,depth,tex,focal):
 for f in range(len(indices)):
    inds=indices[f];poly=np.zeros((5,5));count=0
    for k in range(3):
        i=inds[k];j=inds[(k+1)%3];a=vertices[i];b=vertices[j];ia=a[2]>=.08;ib=b[2]>=.08
        if ia:
            poly[count,:3]=a;poly[count,3:]=uvs[i];count+=1
        if ia!=ib:
            t=(.08-a[2])/(b[2]-a[2]);poly[count,:3]=a+(b-a)*t;poly[count,3:]=uvs[i]+(uvs[j]-uvs[i])*t;count+=1
    for k in range(1,count-1):
        v=np.empty((3,3));uv=np.empty((3,2));v[0]=poly[0,:3];v[1]=poly[k,:3];v[2]=poly[k+1,:3];uv[0]=poly[0,3:];uv[1]=poly[k,3:];uv[2]=poly[k+1,3:]
        triangle(v,uv,color,tid,lighting,buffer,depth,tex,focal)
color=np.full((H,W,3),130,dtype=np.uint8);depth=np.full((H,W),1e10)
for idx,m in enumerate(data['meshes']):
 mat=data['materials'][m['material']]
 if mat['opacity']<.5:continue
 p=np.array(m['p']).reshape(-1,3);matrix=np.array(m['matrix']).reshape(4,4).T
 world=p@matrix[:3,:3].T+matrix[:3,3];v=(world-eye)@view.T
 uv=np.array(m['uv']).reshape(-1,2) if m['uv'] else np.zeros((len(p),2))
 indices=np.array(m['index'] if m['index'] else np.arange(len(p)),dtype=np.int64).reshape(-1,3)
 tid=texture_ids.get(mat.get('asset'),-1)
 base=np.array(mat.get('color') or [1,1,1],dtype=float)
 # Flat ambient illumination deliberately avoids claiming to match GPU shading.
 shade=1.6 if tid<0 else 1.3
 draw(v,uv,indices,base,tid,shade,color,depth,tex,focal)
Image.fromarray(color).save(root/'validation/software-spatial-preview.png')
print('Saved software spatial preview (not browser rendering)')
