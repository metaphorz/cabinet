"""Download the verified external image sources when network access is available.
Keeps the original source URLs and attributions. Run npm run package afterward
for an updated standalone HTML with downloaded images embedded.
"""
import json, urllib.request
from pathlib import Path
root=Path(__file__).resolve().parents[1]
p=root/'dist/sources.json';sources=json.loads(p.read_text())
for number,source in sources.items():
    if source.get('localImage') and (root/'dist'/source['localImage']).is_file():
        print(number,'already cached');continue
    request=urllib.request.Request(source['imageUrl'],headers={'User-Agent':'CabinetReconstruction/1.0 (educational art viewer)'})
    try:
        with urllib.request.urlopen(request,timeout=45) as response:
            content_type=response.headers.get('Content-Type','').split(';')[0]
            if content_type not in ['image/jpeg','image/png','image/webp']:raise ValueError('Response is not a supported image: '+content_type)
            data=response.read(80_000_001)
            if len(data)>80_000_000:raise ValueError('Source exceeds the 80 MB download limit')
        suffix={'image/jpeg':'jpg','image/png':'png','image/webp':'webp'}[content_type]
        target=root/'dist/assets'/f'painting-{int(number):02d}.{suffix}'
        target.write_bytes(data);source['localImage']='./assets/'+target.name
        print(number,'downloaded',len(data),'bytes')
    except Exception as error:print(number,'kept existing fallback:',error)
p.write_text(json.dumps(sources,indent=2)+'\n')
