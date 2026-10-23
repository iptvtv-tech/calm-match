#!/usr/bin/env python3
"""Make a copy of the Kokoro model that also reports how long each sound lasts.

The standard kokoro-v1.0.onnx only outputs audio. The timings exist inside it (the duration predictor's
result, /encoder/Cast_output_0, in frames of 600 samples), so this adds that tensor as a second output.
build.py uses it to cut the lead-in and trailing words exactly. Needs no extra packages.

  python3 tools/audio/onnx_timings.py kokoro-v1.0.onnx kokoro-v1.0-timed.onnx
"""
import sys

TENSOR = "/encoder/Cast_output_0"


def varint(b, i):
    r = s = 0
    while True:
        c = b[i]; i += 1; r |= (c & 0x7f) << s; s += 7
        if c < 0x80: return r, i


def enc_varint(n):
    out = bytearray()
    while True:
        c = n & 0x7f; n >>= 7
        if n: out.append(c | 0x80)
        else: out.append(c); return bytes(out)


def ld(fn, payload): return enc_varint((fn << 3) | 2) + enc_varint(len(payload)) + payload


def add_output(src, dst, name=TENSOR):
    b = open(src, "rb").read()
    value_info = ld(1, name.encode()) + ld(2, ld(1, enc_varint(1 << 3) + enc_varint(7)))  # name, int64 tensor
    out, i = bytearray(), 0
    while i < len(b):  # copy ModelProto field by field; append the output to the graph (field 7, graph.output = 12)
        key, j = varint(b, i); fn, wt = key >> 3, key & 7
        if wt == 2:
            n, k = varint(b, j)
            if fn == 7:
                g = b[k:k + n] + ld(12, value_info)
                out += enc_varint(key) + enc_varint(len(g)) + g
            else:
                out += b[i:k + n]
            i = k + n
        elif wt == 0: _, k = varint(b, j); out += b[i:k]; i = k
        elif wt == 1: out += b[i:j + 8]; i = j + 8
        elif wt == 5: out += b[i:j + 4]; i = j + 4
        else: raise ValueError("unexpected wire type %d" % wt)
    open(dst, "wb").write(out)


if __name__ == "__main__":
    add_output(sys.argv[1], sys.argv[2])
    print("wrote", sys.argv[2])
