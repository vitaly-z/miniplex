import { between } from "randomish"
import { Color, Quaternion, Vector3 } from "three"
import { InstancedParticles, Particle } from "vfx-composer-r3f"
import { ECS, lifetime, physics, PhysicsLayers } from "../state"
import { bitmask } from "../util/bitmask"
import { spawnAsteroid } from "./Asteroids"
import { RenderableEntity } from "./RenderableEntity"

export const Bullets = () => (
  <InstancedParticles>
    <planeGeometry args={[0.15, 0.5]} />
    <meshStandardMaterial color={new Color("orange").multiplyScalar(5)} />

    <ECS.Archetype components="isBullet" as={RenderableEntity} />
  </InstancedParticles>
)

const players = ECS.world.archetype("isPlayer")

const jitter = new Quaternion()
const axisZ = new Vector3(0, 0, 1)

export const spawnBullet = () => {
  const [player] = players
  if (!player) return

  const bullet = ECS.world.add({
    isBullet: true,
    ...lifetime(2),

    physics: physics({
      velocity: new Vector3(0, 25, 0)
        .applyQuaternion(player.transform!.quaternion)
        .applyQuaternion(jitter.setFromAxisAngle(axisZ, between(-0.04, 0.04)))
        .add(player.physics!.velocity),
      radius: 0.1,
      restitution: 1,
      linearDamping: 1,
      angularDamping: 1,

      groupMask: bitmask(PhysicsLayers.Bullet),
      collisionMask: bitmask([PhysicsLayers.Asteroid]),

      onContactStart: (other) => {
        /* Destroy bullet */
        ECS.world.addComponent(bullet, "destroy", true)

        /* If the other entity has health, damage it */
        if (other.health !== undefined) {
          other.health -= 270
          if (other.health <= 0) {
            ECS.world.addComponent(other, "destroy", true)

            /* If the other entity was an asteroid, spawn new asteroids */
            if (other.isAsteroid) {
              const scale = other.transform!.scale.x
              if (scale > 0.8) {
                const count = between(3, 10)
                for (let i = 0; i < count; i++) {
                  const direction = new Vector3(
                    Math.cos(((2 * Math.PI) / count) * i),
                    Math.sin(((2 * Math.PI) / count) * i),
                    0
                  )

                  const asteroid = spawnAsteroid(
                    {
                      position: new Vector3()
                        .copy(direction)
                        .add(other.transform!.position)
                    },
                    scale * between(0.5, 0.9)
                  )

                  asteroid.physics!.velocity = direction
                    .clone()
                    .multiplyScalar(15)
                }
              }
            }
          }
        }
      }
    }),

    spatialHashing: {},
    neighbors: [],

    render: (
      <ECS.Component name="transform">
        <Particle
          position={player.transform!.position}
          quaternion={player.transform!.quaternion}
        />
      </ECS.Component>
    )
  })

  return bullet
}