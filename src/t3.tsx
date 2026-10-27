import React, {useMemo} from 'react';
import * as THREE from 'three';
import {ThreeCanvas} from '@remotion/three';
import {useThree} from '@react-three/fiber';
import {useCurrentFrame} from 'remotion';
import {rand} from './lib';

export type V3 = [number, number, number];
export const W = 1920, H = 1080, FOV = 40;

/* ─────────── 相机：每帧给出位置与注视点；同一参数用于 SVG 标注投影 ─────────── */
export type Cam = {pos: V3; look: V3; fov?: number};
const camCache = new THREE.PerspectiveCamera(FOV, W / H, 0.1, 500);
export const project = (cam: Cam, p: V3): {x: number; y: number; z: number; s: number} => {
	camCache.fov = cam.fov ?? FOV;
	camCache.position.set(...cam.pos);
	camCache.lookAt(...cam.look);
	camCache.updateProjectionMatrix();
	camCache.updateMatrixWorld();
	const v = new THREE.Vector3(...p);
	const dist = v.distanceTo(camCache.position);
	v.project(camCache);
	return {x: (v.x * 0.5 + 0.5) * W, y: (-v.y * 0.5 + 0.5) * H, z: v.z, s: 14 / dist};
};


export const Stage3D: React.FC<{cam: Cam; children: React.ReactNode; fog?: string; dial?: boolean}> = ({cam, children, fog, dial = true}) => (
	<ThreeCanvas
		width={W}
		height={H}
		style={{position: 'absolute', left: 0, top: 0}}
		camera={{fov: cam.fov ?? FOV, position: cam.pos, near: 0.1, far: 500}}
		gl={{antialias: true, alpha: true}}
		onCreated={({camera}) => {
			camera.lookAt(...cam.look);
		}}
	>
		<SyncCam cam={cam} />
		{fog ? <fog attach="fog" args={[fog, 18, 60]} /> : null}
		<ambientLight intensity={0.35} />
		<pointLight position={[8, 10, 10]} intensity={260} />
		<pointLight position={[-10, -4, 6]} intensity={90} color="#88aaff" />
		{dial ? <GroundDial /> : null}
		{children}
	</ThreeCanvas>
);
// react-three-fiber：每次渲染更新默认相机
const SyncCam: React.FC<{cam: Cam}> = ({cam}) => {
	const {camera} = useThree();
	camera.position.set(...cam.pos);
	(camera as THREE.PerspectiveCamera).fov = cam.fov ?? FOV;
	camera.lookAt(...cam.look);
	(camera as THREE.PerspectiveCamera).updateProjectionMatrix();
	return null;
};

/* ─────────── 光晕贴图（径向渐变），加法混合 ─────────── */
let glowTex: THREE.Texture | null = null;
const getGlow = () => {
	if (glowTex) return glowTex;
	const c = document.createElement('canvas');
	c.width = c.height = 128;
	const g = c.getContext('2d')!;
	const grd = g.createRadialGradient(64, 64, 0, 64, 64, 64);
	grd.addColorStop(0, 'rgba(255,255,255,1)');
	grd.addColorStop(0.25, 'rgba(255,255,255,0.55)');
	grd.addColorStop(0.6, 'rgba(255,255,255,0.12)');
	grd.addColorStop(1, 'rgba(255,255,255,0)');
	g.fillStyle = grd;
	g.fillRect(0, 0, 128, 128);
	glowTex = new THREE.CanvasTexture(c);
	return glowTex;
};
export const Glow: React.FC<{pos: V3; color: string; size: number; opacity?: number}> = ({pos, color, size, opacity = 1}) => (
	<sprite position={pos} scale={[size, size, 1]}>
		<spriteMaterial map={getGlow()} color={color} transparent opacity={opacity} blending={THREE.AdditiveBlending} depthWrite={false} />
	</sprite>
);

/* ─────────── 元素球：自发光球体 + 光晕 ─────────── */
export const Ball: React.FC<{pos: V3; color: string; r?: number; glow?: number; opacity?: number; wire?: boolean}> = ({pos, color, r = 0.5, glow = 1, opacity = 1, wire}) => (
	<group position={pos}>
		<mesh>
			<sphereGeometry args={[r, 40, 28]} />
			<meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.55 * glow} metalness={0.3} roughness={0.35} transparent={opacity < 1} opacity={opacity} wireframe={wire} />
		</mesh>
		{glow > 0 ? <Glow pos={[0, 0, 0]} color={color} size={r * 5 * glow} opacity={0.6 * opacity} /> : null}
	</group>
);

/* ─────────── 环（torus） ─────────── */
export const Ring: React.FC<{r: number; tube?: number; color: string; rot?: V3; pos?: V3; opacity?: number; arc?: number; emissive?: number}> = ({r, tube = 0.03, color, rot = [Math.PI / 2, 0, 0], pos = [0, 0, 0], opacity = 1, arc = Math.PI * 2, emissive = 0.6}) => (
	<mesh rotation={rot} position={pos}>
		<torusGeometry args={[r, tube, 12, 160, arc]} />
		<meshStandardMaterial color={color} emissive={color} emissiveIntensity={emissive} transparent opacity={opacity} />
	</mesh>
);

/* ─────────── 光束：两点之间的圆柱 ─────────── */
const UP = new THREE.Vector3(0, 1, 0);
export const Beam: React.FC<{a: V3; b: V3; color: string; r?: number; opacity?: number; p?: number}> = ({a, b, color, r = 0.04, opacity = 1, p = 1}) => {
	const A = new THREE.Vector3(...a), B = new THREE.Vector3(...b);
	const Bp = A.clone().lerp(B, Math.max(0.001, p));
	const mid = A.clone().add(Bp).multiplyScalar(0.5);
	const dir = Bp.clone().sub(A);
	const len = dir.length();
	const q = new THREE.Quaternion().setFromUnitVectors(UP, dir.clone().normalize());
	return (
		<mesh position={mid.toArray() as V3} quaternion={q}>
			<cylinderGeometry args={[r, r, len, 10]} />
			<meshStandardMaterial color={color} emissive={color} emissiveIntensity={1} transparent opacity={opacity} />
		</mesh>
	);
};

/* ─────────── 粒子：每帧由函数给出位置 ─────────── */
export const Points: React.FC<{n: number; fn: (i: number) => V3; color: string; size?: number; opacity?: number}> = ({n, fn, color, size = 0.08, opacity = 0.9}) => {
	const arr = new Float32Array(n * 3);
	for (let i = 0; i < n; i++) {
		const p = fn(i);
		arr[i * 3] = p[0]; arr[i * 3 + 1] = p[1]; arr[i * 3 + 2] = p[2];
	}
	return (
		<points>
			<bufferGeometry>
				<bufferAttribute attach="attributes-position" args={[arr, 3]} count={n} array={arr} itemSize={3} />
			</bufferGeometry>
			<pointsMaterial color={color} size={size} map={getGlow()} transparent opacity={opacity} blending={THREE.AdditiveBlending} depthWrite={false} sizeAttenuation />
		</points>
	);
};

/* ─────────── 星尘背景：随主题着色，缓慢漂移 ─────────── */
export const Nebula: React.FC<{color: string; color2: string; n?: number; spread?: number}> = ({color, color2, n = 900, spread = 40}) => {
	const f = useCurrentFrame();
	const fn = (k: number) => (i: number): V3 => {
		const a = rand(i + k) * Math.PI * 2 + f * 0.0015 * (1 + rand(i + 3));
		const r = 6 + rand(i + 1 + k) * spread;
		return [Math.cos(a) * r, (rand(i + 2 + k) - 0.5) * 22, Math.sin(a) * r - 10];
	};
	return (
		<>
			<Points n={n} fn={fn(0)} color={color} size={0.12} opacity={0.5} />
			<Points n={n / 3} fn={fn(9)} color={color2} size={0.2} opacity={0.45} />
		</>
	);
};

/* ─────────── 卦爻实体：阳爻一整条，阴爻两段 ─────────── */
export const Trigram3D: React.FC<{lines: number[]; pos: V3; rot?: V3; color: string; w?: number; scale?: number}> = ({lines, pos, rot = [0, 0, 0], color, w = 3, scale = 1}) => (
	<group position={pos} rotation={rot} scale={scale}>
		{lines.map((l, i) => {
			const y = (i - (lines.length - 1) / 2) * 0.62;
			return l ? (
				<mesh key={i} position={[0, y, 0]}>
					<boxGeometry args={[w, 0.36, 0.5]} />
					<meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.45} metalness={0.4} roughness={0.3} />
				</mesh>
			) : (
				<group key={i}>
					<mesh position={[-w * 0.29, y, 0]}>
						<boxGeometry args={[w * 0.42, 0.36, 0.5]} />
						<meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.45} metalness={0.4} roughness={0.3} />
					</mesh>
					<mesh position={[w * 0.29, y, 0]}>
						<boxGeometry args={[w * 0.42, 0.36, 0.5]} />
						<meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.45} metalness={0.4} roughness={0.3} />
					</mesh>
				</group>
			);
		})}
	</group>
);

export const ringPos = (r: number, i: number, n: number, y = 0, off = 0): V3 => {
	const a = (i / n) * Math.PI * 2 + off;
	return [Math.cos(a) * r, y, Math.sin(a) * r];
};
export const orbit = (r: number, ang: number, h: number, look: V3 = [0, 0, 0], fov = FOV): Cam => ({pos: [Math.cos(ang) * r, h, Math.sin(ang) * r], look, fov});
export {useMemo};

/* ─────────── 刻度地盘：所有 3D 场景脚下的旋转罗盘 ─────────── */
import {getTheme} from './lib';
export const GroundDial: React.FC = () => {
	const f = useCurrentFrame();
	const th = getTheme();
	const y = -3.4;
	return (
		<group position={[0, y, 0]} rotation={[0, f * 0.002, 0]}>
			<mesh rotation={[-Math.PI / 2, 0, 0]}>
				<ringGeometry args={[6.2, 9.4, 96]} />
				<meshBasicMaterial color={th.bg[0]} transparent opacity={0.55} side={THREE.DoubleSide} />
			</mesh>
			{[6.2, 7.4, 8.4, 9.4].map((r) => (
				<mesh key={r} rotation={[-Math.PI / 2, 0, 0]}>
					<ringGeometry args={[r - 0.02, r + 0.02, 160]} />
					<meshBasicMaterial color={th.a} transparent opacity={0.28} side={THREE.DoubleSide} />
				</mesh>
			))}
			{Array.from({length: 72}).map((_, i) => {
				const a = (i / 72) * Math.PI * 2;
				const long = i % 3 === 0;
				const r0 = long ? 8.4 : 8.8, r1 = 9.4;
				const r = (r0 + r1) / 2;
				return (
					<mesh key={i} position={[Math.cos(a) * r, 0.01, Math.sin(a) * r]} rotation={[-Math.PI / 2, 0, -a]}>
						<planeGeometry args={[r1 - r0, long ? 0.07 : 0.04]} />
						<meshBasicMaterial color={long ? th.b : th.a} transparent opacity={0.8} side={THREE.DoubleSide} />
					</mesh>
				);
			})}
			{Array.from({length: 24}).map((_, i) => {
				const a = (i / 24) * Math.PI * 2;
				return (
					<mesh key={'s' + i} position={[Math.cos(a) * 6.8, 0.01, Math.sin(a) * 6.8]} rotation={[-Math.PI / 2, 0, -a]}>
						<planeGeometry args={[1.2, 0.02]} />
						<meshBasicMaterial color={th.a} transparent opacity={0.3} side={THREE.DoubleSide} />
					</mesh>
				);
			})}
		</group>
	);
};
