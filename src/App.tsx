import { useMemo, useState } from 'react'
import heic2any from 'heic2any'
import { useAsync } from 'react-use'
import { download } from './lib/download'
import { blobToFile } from './lib/blob-to-file'

const IMAGE_TYPES = {
  JPEG: 'image/jpeg',
  PNG: 'image/png',
  GIF: 'image/gif',
}

function App() {
  const [files, setFiles] = useState<File[]>([])
  const [fileType, setFileType] = useState(IMAGE_TYPES.JPEG)

  const {
    value: convertedImages,
    error,
    loading: isLoading,
  } = useAsync(async () => {
    if (!files) return []
    return await Promise.all(
      files.map(async (file) =>
        blobToFile(
          (await heic2any({ blob: file, toType: fileType })) as Blob,
          `${file.name.replace(/\.heic$/i, '')}.${fileType.split('/')[1]}`,
        ),
      ),
    )
  }, [files])

  const dataUrls = useMemo(() => {
    if (!convertedImages) return []
    return convertedImages.map((image) => URL.createObjectURL(image))
  }, [convertedImages])

  return (
    <div className="flex h-screen flex-col items-center justify-center gap-4 text-center p-2">
      <h1 className="text-xl font-semibold">HEIC Converter</h1>

      <div className="join">
        <input
          className="file-input w-full max-w-xs file-input-bordered join-item"
          type="file"
          accept=".heic"
          multiple={true}
          onChange={(e) => setFiles(Array.from(e.target.files ?? []))}
        />
        <select
          className="select select-bordered join-item"
          onChange={(e) => setFileType(e.target.value)}
          value={fileType}
        >
          <option disabled={true}>Export type</option>
          {Object.entries(IMAGE_TYPES).map(([key, value]) => (
            <option key={key} value={value}>
              {key}
            </option>
          ))}
        </select>
      </div>

      {isLoading && <span className="loading loading-spinner loading-lg" />}
      {error && <p className="text-red-500">{error.message}</p>}
      {convertedImages && convertedImages?.length > 0 && (
        <button
          className="btn btn-primary"
          onClick={() =>
            convertedImages.forEach((file) => download(file.name, file))
          }
        >
          Download all
        </button>
      )}
      <div className="flex flex-row flex-wrap gap-2 items-center justify-center">
        {dataUrls.map((dataUrl, index) => (
          <img
            key={index}
            src={dataUrl}
            className="max-w-full max-h-64 object-contain"
          />
        ))}
      </div>
    </div>
  )
}

export default App
