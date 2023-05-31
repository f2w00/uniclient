import { mkdir, mkdirSync, writeFile, writeFileSync } from 'fs'
import { ErrorHandler } from '../../../client/error/error'
import { workspaceAttribute } from '../../../client/workspace/workspace'

export interface IProject {
    workspace: workspaceAttribute
    storagePath: string
    projectName: string
    projectType: string
}

export class ProjectManagerFactory {
    static currentManager: ProjectManager
    static currentProject: IProject

    constructor() {}

    static produceProjectManager(project: IProject) {
        let manager = new ProjectManager(project)
        ProjectManagerFactory.currentProject = project
        ProjectManagerFactory.currentManager = manager
        return manager
    }

    static createProject(filePath: string, project: IProject) {
        mkdirSync(filePath)
        mkdirSync(filePath + '\\.project')
        writeFileSync(filePath + '\\.project' + '/project.json', JSON.stringify(project))
        ProjectManagerFactory.currentManager = new ProjectManager(project)
    }

    static getCurrentProject() {
        return ProjectManagerFactory.currentProject
    }
}

export class ProjectManager {
    constructor(project: IProject) {}
}
