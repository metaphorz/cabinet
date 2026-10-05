import json
from pathlib import Path
root=Path(__file__).resolve().parents[1]
manifest=json.loads((root/'SOURCE-RESEARCH.json').read_text())
sources={str(p['id']):{k:p[k] for k in ['imageUrl','sourceUrl','resolution','rights','imageSourceUrl','museumImageUrl'] if k in p} for p in manifest['paintings'] if p['status']=='exact-standalone'}
extra_path=root/'GALLERY-DETAIL-RESEARCH.json'
if extra_path.exists():
    for detail in json.loads(extra_path.read_text())['details']:
        if detail['status']=='verified-gallery-detail':
            sources[str(detail['id'])]={k:detail[k] for k in ['imageUrl','sourceUrl','credit','rights','resolution']}
            sources[str(detail['id'])]['kind']='gallery-detail'
target=root/'dist'/'sources.json'
if target.exists():
    for number,source in json.loads(target.read_text()).items():
        if number in sources and source.get('localImage'):sources[number]['localImage']=source['localImage']
target.write_text(json.dumps(sources,indent=2))
