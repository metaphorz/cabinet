import bpy,json,math
from pathlib import Path
from mathutils import Matrix,Vector
root=Path(__file__).resolve().parents[1]
data=json.loads((root/'validation/scene.json').read_text())
bpy.ops.object.select_all(action='SELECT');bpy.ops.object.delete(use_global=False)
scene=bpy.context.scene
scene.render.engine='CYCLES';scene.cycles.samples=16;scene.cycles.use_denoising=True
scene.render.resolution_x=1280;scene.render.resolution_y=800;scene.render.resolution_percentage=100
scene.world.use_nodes=True;scene.world.node_tree.nodes['Background'].inputs[0].default_value=(.7,.77,.78,1);scene.world.node_tree.nodes['Background'].inputs[1].default_value=.5
materials={};art={a['id']:a for a in data['paintings']}
conversion=Matrix(((1,0,0,0),(0,0,-1,0),(0,1,0,0),(0,0,0,1)))
for name,raw in data['materials'].items():
 m=bpy.data.materials.new(name);m.use_nodes=True;p=m.node_tree.nodes.get('Principled BSDF');color=raw.get('color') or [.5,.5,.5];p.inputs['Base Color'].default_value=(*color,1);p.inputs['Roughness'].default_value=raw['roughness'];p.inputs['Metallic'].default_value=raw['metalness']
 if raw['opacity']<1:p.inputs['Alpha'].default_value=raw['opacity'];p.inputs['Transmission Weight'].default_value=.45
 asset=raw.get('asset')
 if asset:
  image=m.node_tree.nodes.new('ShaderNodeTexImage')
  if asset.startswith('crop-'):
   a=art[int(asset[5:])];image.image=bpy.data.images.load(str(root/'dist/assets/reference.png'),check_existing=True)
   uv=m.node_tree.nodes.new('ShaderNodeTexCoord');scale=m.node_tree.nodes.new('ShaderNodeVectorMath');scale.operation='MULTIPLY';offset=m.node_tree.nodes.new('ShaderNodeVectorMath');offset.operation='ADD';x,y,w,h=a['crop'];scale.inputs[1].default_value=(w/1453,h/1080,1);offset.inputs[1].default_value=(x/1453,1-(y+h)/1080,0);m.node_tree.links.new(uv.outputs['UV'],scale.inputs[0]);m.node_tree.links.new(scale.outputs[0],offset.inputs[0]);m.node_tree.links.new(offset.outputs[0],image.inputs[0])
  else:image.image=bpy.data.images.load(str(root/'dist'/asset),check_existing=True)
  m.node_tree.links.new(image.outputs['Color'],p.inputs['Base Color']);m.node_tree.links.new(image.outputs['Color'],p.inputs['Emission Color']);p.inputs['Emission Strength'].default_value=.13
 materials[name]=m
for i,raw in enumerate(data['meshes']):
 matrix=conversion@Matrix([raw['matrix'][i::4] for i in range(4)])
 vertices=[tuple(matrix@Vector(raw['p'][j:j+3])) for j in range(0,len(raw['p']),3)]
 indices=raw['index'] or list(range(len(vertices)));faces=[indices[j:j+3] for j in range(0,len(indices),3)]
 mesh=bpy.data.meshes.new(str(i));mesh.from_pydata(vertices,[],faces);mesh.update();o=bpy.data.objects.new(str(i),mesh);scene.collection.objects.link(o);o.data.materials.append(materials[raw['material']])
 if raw['uv']:
  uv=o.data.uv_layers.new();coords=raw['uv']
  for poly in o.data.polygons:
   for li in poly.loop_indices:
    vi=o.data.loops[li].vertex_index;uv.data[li].uv=(coords[vi*2],coords[vi*2+1])
 # Preserve hard architectural edges; smooth non-box sculptural meshes only.
 if len(vertices)>100:
  for poly in mesh.polygons:poly.use_smooth=True

def light(name,kind,position,energy,color,size=1,target=None):
 d=bpy.data.lights.new(name,kind);d.energy=energy;d.color=color
 if kind=='AREA':d.shape='DISK';d.size=size
 o=bpy.data.objects.new(name,d);scene.collection.objects.link(o);o.location=position
 if target:o.rotation_euler=(Vector(target)-o.location).to_track_quat('-Z','Y').to_euler()
 return o
sun=light('Daylight','SUN',(-15,-6,12),2.5,(1,.92,.78),target=(4,4,0));sun.data.angle=.12
light('Window fill','AREA',(-8.6,-1,5),1700,(.78,.89,1),6,(2,2,2))
light('Warm room reflection','AREA',(5,3,6),650,(1,.85,.66),5,(0,0,2))
light('Candles','POINT',(0,.5,6.2),150,(1,.63,.3))
c=bpy.data.cameras.new('Preview camera');co=bpy.data.objects.new('Preview camera',c);scene.collection.objects.link(co);co.location=(-5.7,-5.85,1.72);direction=Vector((.41687*math.cos(.19),.90896*math.cos(.19),math.sin(.19)));co.rotation_euler=direction.to_track_quat('-Z','Y').to_euler();c.angle=math.radians(62);scene.camera=co
scene.render.image_settings.file_format='PNG';scene.render.filepath=str(root/'validation/spatial-preview.png')
bpy.ops.wm.save_as_mainfile(filepath=str(root/'validation/spatial-preview.blend'));bpy.ops.render.render(write_still=True)
